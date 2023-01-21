# visualize-clonal-trees
code repository for group COMPs at Computer Science Department of Carleton College, MN, 2022 - 2023

Basic code structure as of 2023-01-20 (date per ISO 8601):
    d3_playground 
        - This contains HTML, JS, and CSS files for tinkering with d3 tree display and interactivity components. 
    distance_measures
        - Contains a python file for each of the four distance measures we are supporting: Parent-Child, Ancestor-Descendent Caset and Disc, which have functions to calculate the per-node contributions for each distance measure and to return a json object representing the tree, with the contribution data embedded (this function interacts with api.py)
        - Contains a python file (utils.py) that contains functions shared between the distance measures - this mostly consists of various tree/node/mutation operations
    input_convesion
        - Contains python files for conversion of Bourque, mlted, and Newick format tree files to dot format files
        - Contains roughly 100 trees encoded in the dot format, each in separate files. 
    layla_code_for_caset_and_disc
        - Contains the python files provided by Layla's research for computing caset and disc (along with a shared utils file)
    py_scripts
        - Assortment of python scripts that currently includes: converting dot trees to newick trees, checking input for validity and cycles, and computing parent-child difference for dot-format input files. 
    static
        - Contains JS and CSS files for each of the pages of our webapp
    templates
        - Contains our shared HTML basis for our webapp: index.html
    api.py
        - Coordinates backend calls to our distance_measure files (returns JSON objects for each of the distance measure queries)
    app.py 
        - Simple frontend Flask app to run webapp
