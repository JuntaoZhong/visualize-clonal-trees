"""
Just contains general function to handle retrieving contribution data depending on distance measure selected
"""
import networkx as nx
from networkx.readwrite import json_graph
import distance_measures.utils as utils
import distance_measures.ancestor_descendant as AD
import distance_measures.disc as DISC
import distance_measures.caset as CASet
import distance_measures.parent_child as PC
def dist_main(distance_measure, filename_1, filename_2):
    """
    Required:
        - The distance_measure selected as a string and wo filesnames, each corresponding to a file containing a DOT tree
    Returns:
        - Node-to-contribution, mutation-to-contribution, and node-to-mutation dictionaries
            for both trees under the selected distance measure
    Note:
        This is for use with api.py.
    """
    g_1 = nx.DiGraph(nx.nx_pydot.read_dot(filename_1))
    g_2 = nx.DiGraph(nx.nx_pydot.read_dot(filename_2))

    if distance_measure == "parent_child":
        calculated_values = PC.get_contributions(g_1,g_2)
    elif distance_measure == "ancestor_descendant":
        calculated_values = AD.get_contributions(g_1,g_2)
    elif distance_measure == "caset":
        calculated_values = CASet.get_contributions(g_1,g_2)
    elif distance_measure == "disc":
        calculated_values = DISC.get_contributions(g_1,g_2)
    else:
        print("Not a valid distance measure")
        exit(1)

    node_contribution_dict_1, node_contribution_dict_2, mutation_contribution_dict_1, mutation_contribution_dict_2, node_mutations_dict_1, node_mutations_dict_2, distance = calculated_values
    #Addes node contributions to tree structure
    nx.set_node_attributes(g_1,node_contribution_dict_1)
    nx.set_node_attributes(g_2,node_contribution_dict_2)
    #Gets trees
    node_contribution_tree_1 = json_graph.tree_data(g_1, root=utils.get_root(g_1))
    node_contribution_tree_2 = json_graph.tree_data(g_2, root=utils.get_root(g_2))
    return (node_contribution_tree_1, node_contribution_tree_2, mutation_contribution_dict_1, mutation_contribution_dict_2, node_mutations_dict_1, node_mutations_dict_2, distance)

