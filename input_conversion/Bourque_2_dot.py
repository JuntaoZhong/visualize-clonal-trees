import sys

'''
Takes in all the lines of a bourque file and returns all the nodes
'''
def get_all_nodes(all_lines):
    all_nodes = []
    for i in range(0, len(all_lines)):
        words = all_lines[i].split()    
        if i > 0 and len(all_lines[i]) > 2:
            node1 = words[0]
            node2 = words[1]
            if node1 not in all_nodes:
                all_nodes.append(node1)
            if node2 not in all_nodes:
                all_nodes.append(node2)        
    return all_nodes

'''
Takes in an output file and a list of nodes and writes all the nodes with their labels
'''
def write_labels(output, nodes):
    for i in nodes:
        if "_" in i:
            labels = i.split("_")
            delim = ","
            all_labels = delim.join(labels)
            output.write("\t" + str(i) + " [label=\"" + all_labels + "\"];\n")
        else:
            output.write("\t" + str(i) + " [label=\"" + str(i) + "\"];\n")

'''
Writes the first line
'''
def write_first_line(output):
    output.write("digraph Tree {\n")

'''
Takes in an output file and all the lines of a bourque file and writes all the parent-child relationships
'''
def write_pc_relationships(output, all_lines):
    for i in range(1, len(all_lines)):
        words = all_lines[i].split()    
        if len(all_lines[i]) > 2:
            node1 = words[0]
            node2 = words[1]
            output.write("\t" + str(node1) + " -> " + str(node2) + ";\n")

'''
Writes the last line
'''
def write_last_line(output):
    output.write("}")

if __name__ == "__main__":
    bourque_input = open(sys.argv[1], "r")
    output = open(sys.argv[2], "w")
    all_lines = bourque_input.readlines()
    all_nodes = get_all_nodes(all_lines)
    write_first_line(output)
    write_labels(output, all_nodes)
    write_pc_relationships(output, all_lines)
    write_last_line(output)

