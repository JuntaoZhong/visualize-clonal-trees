#!/usr/bin/python3
import pydot
import networkx as nx
# pip install pydot

def draw_tree(filename, print_tree = False):
	graphs = pydot.graph_from_dot_file(filename)
	graph = graphs[0]
	return graph
	if print_tree:
		graph.write_png('../images/tree-display.png')
		print(f"read in tree file '{filename}' successful")
	return graph

def cycle_detection(filename):
	nx_g = nx.DiGraph(nx.drawing.nx_pydot.read_dot(filename))
	cycles = nx.simple_cycles(nx_g)
	str_cycle = ''
	for i in cycles:
		i.append(i[0])
		str_cycle += " -> ".join(i) + "\n"
	return str_cycle

if __name__ == "__main__":
	try:
		# tree = draw_tree("test-tree.dot", print_tree=True)
		tree = draw_tree("simple-tree.dot", print_tree=True)
		cycle_detection("simple-tree.dot")
	except KeyboardInterrupt:
		pass  # dont throw an exception when CTRL + C