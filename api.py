'''
    Tree CS COMPs
'''
import sys
import flask
import json
sys.path.append('py_scripts')
import check_input
import psycopg2
import os
import pydot

api = flask.Blueprint('api', __name__)

@api.route('/showTreeFromDot/<dot_fname>')
def view_tree(dot_fname):
    dot_fpath = "examples/" + dot_fname

    str_cycle = check_input.cycle_detection(dot_fpath) # will be empty if no cycle

    print(str_cycle)

    if len(str_cycle) == 0:
        graph = pydot.graph_from_dot_file(dot_fpath)[0]
        graph.write_png('static/static-img/tree-display.png')

    return json.dumps(str_cycle)

@api.route('/cats/') 
def get_cats():
    # Of course, your API will be extracting data from your postgresql database.
    # To keep the structure of this tiny API crystal-clear, I'm just hard-coding data here.
    cats = [{'name':'Emma', 'birth_year':1983, 'death_year':2003, 'description':'the boss'},
            {'name':'Aleph', 'birth_year':1984, 'death_year':2002, 'description':'sweet and cranky'},
            {'name':'Curby', 'birth_year':1999, 'death_year':2000, 'description':'gone too soon'},
            {'name':'Digby', 'birth_year':2000, 'death_year':2018, 'description':'the epitome of Cat'},
            {'name':'Max', 'birth_year':1998, 'death_year':2009, 'description':'seismic'},
            {'name':'Scout', 'birth_year':2007, 'death_year':None, 'description':'accident-prone'}]
    return json.dumps(cats)

@api.route('/dogs/') 
def get_dogs():
    dogs = [{'name':'Ruby', 'birth_year':2003, 'death_year':2016, 'description':'a very good dog'},
            {'name':'Maisie', 'birth_year':2017, 'death_year':None, 'description':'a very good dog'}]
    return json.dumps(dogs)

