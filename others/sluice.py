import threading
from Queue import Queue

class Flow(object):

    def __init__(self, maxsize=None):
        self.queue = Queue(maxsize)

    def put(self, record):
        self.queue.put(record)

    def get(self):
        return self.queue.get()

class Gate(object):

    def __init__(self, handler):
        self._handler = handler

    def handle(self, record):
        self._handler(record)

    def turnon(self):
        pass

    def turnoff(self):
        pass

    def turnup(self):
        pass

    def turndown(self):
        pass

class Pool(object):

    def __init__(self):
        self.flows = []
        self.gates = []
        self.thread = threading.Thread(target=self._run)
        self.thread.start()
    
    def _run(self):
        pass

    def flow(self, flow):
        if flow not in self.flows:
            self.flows.append(flow)

    def gate(self, gate):
        if gate not in self.gates:
            self.gates.append(gate)


'''
Usage:

a = Flow()
b = Flow()
g = Gate()

p = Pool()
p.flow(a)
p.flow(b)
p.gate(g)

g.turnon()
g.turnoff()
g.turnup()
g.turndown()

for i in range(1000):
    a.write(i)
    b.write(i)
'''

