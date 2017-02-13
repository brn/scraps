/**
 * @fileoverview
 * @author Taketoshi Aono
 */


interface SharedDataBlockEvent {
}


interface ReadSharedMemory {
  [[Order]]: 'SeqCst' | 'Unordered';
  [[NoTear]]: boolean;
  [[Block]]: SharedData
  [[ByteIndex]]: uint32
  [[ElementSize]]: uint32
}


interface WriteSharedMemory extends ReadSharedMemory {
  [[Payload]]: List;
}


interface ReadModifyWriteSharedMemory extends ReadSharedMemory, WriteSharedMemory {
  [[ModifyOp]](payload: List): List
}

interface AgentEvents {
  [[AgentSignifier]]: string
  [[EventList]]: List<Event>
}


interface ChosenValue {
  [[Event]]: Event;
  [[ChosenValue]]: List<byte>
}

interface CandidateExecutions {
  [[EventList]]: List<AgentEvents>;
  [[ChosenValues]]: List<ChosenValue>;
  [[AgentOrder]]: AgentOrder;
  [[ReadsBytesFrom]]: Relation
  [[ReadsFrom]]: Relation;
  [[HostSynchromizesWith]]: Relation;
  [[SynchronizedWith]]: Relation;
  [[HappensBefore]]: Relation;
}


function EventSet(execution) {
  let events = new Set();
  for (let eventList of execution.[[EventLists]]) {
    for (let E of eventList) {
      events.set(E);
    }
  }
  return events;
}

function SharedDataBlockEventSet(execution) {
  let events = new Set();
  for (E in EventSet(execution)) {
    if (E === ReadSharedMemory || E === WriteSharedMemory || E === ReadModifyWriteSharedMemory) {
      events.add(E);
    }
  }
  return events;
}


function HostEventSet(execution) {
  let events = new Set();
  for (E in EventSet(execution)) {
    if (!(E in SharedDataBlockEventSet)) {
      events.add(E);
    }
  }
  return events;
}

enum AgentOrders {
  BEFORE,
  AFTER
}

constraints function AgentOrder(E: Event, D: Event) {
  for (let eventList of this.[[EventList]]) {
    if (E in eventList && D in eventList) {
      if (eventList.indexOf(D) > eventList.indexOf(E)) {
        return AgentOrders.BEFORE
      }
      return AgentOrders.AFTER;
    }
  }
}


function [[ReadsBytesFrom]](R: SharedDataBlockEvent) {
  let list = new List(R.[[ElementSize]]);
  let byteLocation = R.[[ByteIndex]];
  for (let i = 0; i < R.[[ElementSize]]; i++) {
    list.push(R[byteLocation])
    byteLocation++;
  }
  return list;
}


constraint function [[ReadsFrom]](R: SharedDataBlockEvent, W: SharedDataBlockEvent) {
  let Ws = this.[[ReadsBytesFrom]](R);
  assert.ok(Ws.every(v => v is WriteSharedMemory || v is ReadModifyWriteSharedMemory));
  if (Ws.contains(W)) {
    return true
  }
  return false;
}

relational function SynchronizesWith(R: SharedDataBlockEvent|HostEvent, W: SharedDataBlockEvent|HostEvent) {
  if (R is SharedDataBlockEvent && W is SharedDataBlockEvent && R.[[Order]] === 'SeqCst' && ReadsFrom(R, W)) {
    assert.ok(R is ReadSharedMemory || R is ReadModifyWriteSharedMemory);
    assert.ok(W is WriteSharedMemory || R is ReadModifyWriteSharedMemory);
    if (W.[[Order]] === 'SeqCst' && R.length === W.length) {
      return true;
    } else if (W.[[Order]] === 'Init') {
      let allInitReads = true;
      if ([[ReadsFrom]](R, W)) {
        allInitReads = false;
      }
      allInitReads? true: false;
    }
    return false;
  } else if (R is HostEvent && W is HostEvent) {
    if (E host-synchronized-with D) {
      return true;
    }
    return false;
  }
  return false;
}

relational function HappensBefore(E: Event, D: Event) {
  if (AgentOrder(E, D) == AgentOrders.BEFORE) {
    return true;
  } else if (SynchronizesWith(E, D)) {
    return true;
  } else if (SharedDataBlockEvent(this)[E] && SharedDataBlockEvent(this)[D] && E.[[Order]] === 'Init' && E['@overlapping'](D)) {
    assert.ok(D.[[Order]] !== 'Init');
    return true;
  } else {
    for (let F of EventSet(this)) {
      if (F !== E && HappensBefore(E, F) && HappensBefore(F, D)) {
        return true;
      }
    }
  }
  return false;
}
