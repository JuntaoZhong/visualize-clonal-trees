'''
Takes in a Newick string, the current node that is being parsed, and the output file and chooses whether to call the base case, find the next substrings (children) of the current node, or find the next node
'''
def parse_next(newick_string, current_node, output):
    if ',' not in newick_string and '(' not in newick_string or (newick_string[0] == "{" and newick_string[-1] == "}"):
        base_case(newick_string, current_node, output)
    elif newick_string[0] == "(" and newick_string[-1] == ')':
        find_substrings(newick_string, current_node, output)
    else:
        find_next_node(newick_string, current_node, output)
   
'''
Takes in a Newick string, the current node that is being parsed, and the output file and parses the singular node depending on whether it has a singular label or multiple labels
'''
def base_case(newick_string, current_node, output):
    
    #The node has a singular label and is surrounded by parenthesis
    if '{' not in newick_string and newick_string[0] == "(" and newick_string[-1] == ")":
        newick_string = newick_string[1:-1]
        output.write("\t" + str(newick_string) + " [label=\"" + newick_string + "\"];\n")
        output.write("\t" + str(current_node) + " -> " + str(newick_string) + ";\n")
    
    #The node has a singular label and is not surrounded by parenthesis
    elif '{' not in newick_string:
        output.write("\t" + str(newick_string) + " [label=\"" + newick_string + "\"];\n")
        output.write("\t" + str(current_node) + " -> " + str(newick_string) + ";\n")
        
    #The node has multiple labels
    else:
        node_trimmed = newick_string[1:-1]
        labels = node_trimmed.split(',')
        delim = ","
        all_labels = delim.join(labels)
        delim_name = "_"
        node_name = delim_name.join(labels)
        output.write("\t" + str(node_name) + " [label=\"" + all_labels + "\"];\n")
        output.write("\t" + str(current_node) + " -> " + str(node_name) + ";\n")
        

'''
Takes in a Newick string, the current node that is being parsed, and the output file, and finds the next substrings to parse.
'''
def find_substrings(newick_string, current_node, output):
    newick_string = newick_string[1:-1]
    substrings = []
    ignore_comma = False
    curr_substring = ''
    num_opens = 0
    
    #find all substrings
    for j in newick_string:
        if j == '(' or j == "{":
            ignore_comma = True
            curr_substring = curr_substring + j
            num_opens += 1
        elif j == ')' or j == "}":
            num_opens -= 1
            if num_opens == 0:
                ignore_comma = False
            curr_substring = curr_substring + j
        elif j == "," and not ignore_comma:
            substrings.append(curr_substring)
            curr_substring = ''
        elif j == "," and ignore_comma:
            curr_substring = curr_substring + j
        elif j != ',':
            curr_substring = curr_substring + j
    substrings.append(curr_substring)
    
    #Parse all the substrings indivudually
    for i in substrings:                
        parse_next(i, current_node, output)

'''
Takes in a Newick string, the current node that is being parsed, and the output file, and finds the next node to parse.
'''
def find_next_node(newick_string, current_node, output):
    
    #If we are at the root of the tree, find the root and parse the next string
    if ')' in newick_string:
        substrings = newick_string.split(')')
        next_node = substrings[-1]
        
        #Parse the root if it multi-labelled
        if next_node[0] == "{" and next_node[-1] == '}':
            node_trimmed = next_node[1:-1]
            labels = node_trimmed.split(',')
            delim = ","
            all_labels = delim.join(labels)
            delim_name = "_"
            node_name = delim_name.join(labels)
            if current_node is not None:
                output.write("\t" + str(current_node) + " -> " + str(node_name) + ";\n")
            output.write("\t" + str(node_name) + " [label=\"" + all_labels + "\"];\n")
            newick_string = newick_string.replace(next_node, "")
            parse_next(newick_string, node_name, output)
            
        #Parse the root if it is not multi-labelled
        else:
            if current_node is not None:
                output.write("\t" + str(current_node) + " -> " + str(next_node) + ";\n")
            output.write("\t" + str(next_node) + " [label=\"" + next_node + "\"];\n")
            newick_string = newick_string.replace(next_node, "")
            parse_next(newick_string, next_node, output)
            
    #If there are no substrings, find the next node and go into the base case
    elif '}' in newick_string:
        substrings = newick_string.split('}')
        next_node = substrings[-1]
        newick_string = newick_string.replace(next_node, "")
        output.write("\t" + str(current_node) + " -> " + str(next_node) + ";\n")
        base_case(newick_string, next_node, output)

'''
Writes the first line
'''
def write_first_line(output):
    output.write("digraph Tree {\n")

'''
Writes the last line
'''
def write_last_line(output):
    output.write("}")

def convert_newick_2_dot(newick_string):
    newick_string = newick_string.replace(" ", "")
    newick_string = newick_string.replace(";", "")
    dot_string = ""
    dot_string = dot_string + "{"

    output = open("newick_2_dot_tree.txt", "w")

    write_first_line(output)
    parse_next(newick_string, None, output)
    write_last_line(output)
    
    #Write in correct order
    output = open("newick_2_dot_tree.txt", "r+")
    output_lines = output.readlines()

    name_lines = []
    pc_lines = []
    for i in output_lines[1:-1]:
        if "label" in i:
            name_lines.append(i)
        else:
            pc_lines.append(i)
    output.truncate(0)
    output.seek(0)

    final_string = "digraph Tree {\n"
    
    output.write(output_lines[0])
    for i in name_lines:
        #print(i)
        final_string = final_string + i
    for j in pc_lines:
        #print(j)
        final_string = final_string + j

    final_string = final_string + "}"

    removed_newlines = ""
    for i in final_string:
      if i != "\n":
        removed_newlines+=i
    print(f"This is the final string {final_string}\n")
    print(f"This is the final string with newlines removed {removed_newlines}\n")
    #return final_string
    return removed_newlines 
