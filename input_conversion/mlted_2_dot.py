def transform_input(mlted_input_as_list, out):
    '''
    MLTED input is provided as a list where
    each list is a line in a MLTED format 
    tree.
    '''
    print("strict digraph G {", file=out_file)
    print("graph [name=G];", file=out_file)
    node_count = 0
    for line in mlted_input_as_list:
      if '=' in line: 
        node, label = line.split("=")
        print(f"{node_count} [label={label}];", file=out_file)
      elif ':' in line: 
        parent, children = line.split(":")
        children = children.split(",")
        for child in children:
          print(f"{parent} -> {child};", file=out_file)
    print("}", file=out_file)
        
        

if __name__=="__main__":
    in_file = open(sys.argv[1], "r")
    mlted_input_as_list = in_file.readlines()
    out_file = open("tree.gv", "w")
    transform_input(mlted_input_as_list)
  
