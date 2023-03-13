# visualize-clonal-trees
Code repository for group COMPs at Computer Science Department of Carleton College, MN, 2022 - 2023

Contributors:
Josiah Misplon
Quoc Nguyen
Shakeal Hodge
Sam Hiken
Jimmy Zhong
Kanishk Pandey

Comps advisor: Eric Alexander

The user selects a distance measure and also inputs two trees (either in the DOT or Newick format). dual_trees.js makes a GET request to api.py. If either tree is in the Newick format, api.py calls Newick_2_dot_2.py to convert the tree to DOT format. Then, api.py calls distance_measure_contributions.py which then calls the code for the user-selected distance measure. distance_measure_contributions.py then returns the relevant dictionaries for the nodes, mutations, and contributions, and this information is converted into a JSON object in api.py. This JSON object is then passed back to dual_tree.js which then uses D3 to visualize the two trees. 

Basic code structure as of 2023-03-11 (date per ISO 8601):
    distance_measures
        - Contains a python file for each of the four distance measures we are supporting: Parent-Child, Ancestor-Descendent Caset and Disc, which have functions to calculate the per-node and per-mutation contributions for each distance measure
        - Contains a python file (utils.py) that contains functions shared between the distance measures - this mostly consists of various tree/node/mutation operations
        - Contains a python file (distance_measure_contribution.py) that, given a distance measure, gives the relevant dictionaries relating the nodes, mutations, and contributions, along with the distance between the two trees (this function interacts with api.py)
    input_conversion
        - Contains python files for converting Newick format trees to DOT format trees. 
        - Contains roughly 100 simulated trees encoded in the DOT format, each in separate files. 
        - Contains sample Newick format trees
        - Contains DOT format trees that use real data
    static
        - Contains JS and CSS files for each of the pages of our webapp
        - utils.js contains general help functions for dual_tree.js
        - dual_tree.js contains all the visualization functions and primarily uses D3 
    templates
        - Contains our shared HTML basis for our webapp: index.html
        - Contains an info page describing the different distance measures
    api.py
        - Coordinates backend calls to distance_measure_contribution.py (returns JSON objects for each of the distance measure queries)
    app.py 
        - Simple frontend Flask app to run webapp
    CS-department-website
        - Contains the HTML and CSS for our website describing VECTr
    requirements.txt
        - Contains list of Python packages to use with Python 3.8 for running our code (networkx and graphviz are important if trying to set up quickly)
