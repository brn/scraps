Insert the following paragraphs after the third:

A data block that resides in memory that can be referenced from multiple agents concurrently is designated a Shared Data Block.
A Shared Data Block has an identity (for the purposes of equality testing Shared Data Block values) that is address-free: it is tied not to the virtual addresses the block is mapped to in any process, but to the set of locations in memory that the block represents. Shared Data Blocks can also be distinguished from Data Blocks.

The semantics of Shared Data Blocks is defined using Shared Data Block events by the Atomics memory model. Abstract operations below introduce Shared Data Block events and act as the interface between evaluation semantics and the event semantics of the memory model. The events form a candidate execution, on which the memory model acts as a filter. Please consult the memory model for full semantics.

Shared Data Block events are modeled by Records, defined in the Atomics memory model. All agents in an agent cluster share the same candidate execution record in its Agent Record's [[CandidateExecution] field, which is initialized to an empty candidate execution Record.


複数のエージェントが並列に参照する事ができるメモリ領域に属するデータブロックはShared Data Blockと呼ぶ。
SharedDataBlockはアドレスフリー(いかなるプロセスのいかなる仮想アドレスにも紐付かず、そのブロックが表すメモリ上の位置の集合に紐付けられる)なIDを持つ（そのIDはSahredDataBlockの値を比較するのに使用する）
SharedDataBlockはデータブロックとは区別される

SharedDataBlockのセマンティクスはAtomicsのメモリモデルがShredDataBlockイベントを使用することによて定義される。
下記の抽象操作はSahredDataBlockイベントを導入し、実行とメモリモデルのイベントの間のインターフェースとして振る舞う。
イベントは評価候補を生成し、メモリモデルはその上でフィルタとして振る舞う。
SharedDataBlockはAtomicsのメモリモデルに定義されているRecordsによって構成される
全ての絵＝ジェントははエージェントクラスターに属し、同じAgentRecordsの[[CandidateExecution]]フィールドにある評価候補を共有する。
[[CandidateExecution]]フィールドは空の評価候補のRecordによって初期化される。

Atomicsについて

Atomicsオブジェクトは%Atomics%ビルトインオブジェクトであり、Atomicsグローバルオブジェクトの初期値である。Atomicsオブジェクトは通常のオブジェクトである。


 i.e., the ordering of memory events. For example, on x86, a memory write becomes visible to all cores other than the writing core at exactly the same time. On ARM, a memory write may become visible to other cores at different times. This is called copy atomicity.

Access atomicity is the easier problem. Hardware provides access atomic instructions that provide the guarantee. Copy atomicity is more difficult. Memory models concern themselves with prescribing some flavor of copy atomicity by ordering memory events. Access atomicity may be thought of as an orthogonal property that is applied on top of the memory model.


*MemoryModel*

## 我々が原子性について話しているときに何を意味しているのか

原子性は2つの事を意味している。一つは動作が不可分であることである。例えば、メモリへの値をの書き込みが、一度にすべての値を一回で書かれるという事である。それはアクセス原子性と呼ばれる。
二つ目は、別のスレッドがメモリアクセスを観察できるタイミングである。

*例 メモリイベントの順序*

例えば、x86におていはメモリへの書き込みは、書き込みを行うコアを除く全てのコアで正確に同時に可視となる。
ARMにおていは、メモリへの書き込みは他のコアでは違うタイミングで可視となる。これはコピー原子性と呼ばれる。
アクセス原子性は比較的簡単な問題である。ハードウェアがアクセス原子性を保証する命令を提供すれば良い。
コピー原子性はより難しい。メモリモデルはメモリイベントの並べ替えによって自身とコピー原子性の規則を関連させる。
アクセス原子性はメモリモデルの頂点に適用される直交性だと考えられているかもしれない。

## メモリモデルの直感性

メモリモデルとは正確にはメモリイベントの集合にある、関係性の制約の集合である。
メモリイベントはread,write,read-modify-write命令に一致する。
通常、プログラムの直感的なメモリモデルは命令的である: プログラムに意味はステップと各ステップがアルゴリズム的に行う事である。
このセクションを除く、ECMA264は命令的に指定されている。
それに対して、メモリモデルは満たさなければならない公理の制約の集合と等しい:プログラムの意味はこれらの制約を満たす数学的な対象である。
可能な限りメモリの値をを組み立てるアルゴリズムを構築する代わりに、このモデルは関係性の制約を通して、直接的にプログラムで許されるうる全てのメモリ値の集合を説明する。

interface ReadSharedMemory {
  [[Order]]: 'SeqCst' | 'Unordered';
  [[NoTear]]: boolean;
  [[Block]]: SharedData
  [[ByteIndex]]: uint32
  [[ElementSize]]: uint32
}


