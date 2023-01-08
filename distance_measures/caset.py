import argparse
import pickle

from utils import *

"""
CASet.py calculates pairwise CASet distances between all trees in an input file with one Newick string on each line.
Defaults to intersection distance.
Command line arguments:
[-o --outputFile file] [-u --union] [-p --pickle file] [-t --treePrint] [-m --minmax]
"""
def get_contributions()

def caset(mutations, t1_ancestors, t2_ancestors):
    """
    Compute the CASet distance between two trees stored as ancestor sets.
    :param mutations: the set of mutations over which to sum
    :param t1_ancestors: a dict storing the t1 ancestor sets of every mutation
    :param t2_ancestors: a dict storing the t2 ancestor sets of every mutation
    :return: the CASet distance between t1 and t2
    """
    m = len(mutations)
    total = 0
    for i in range(m):
        for j in range(i + 1, m):
            t1_ca_set = t1_ancestors[mutations[i]] & t1_ancestors[mutations[j]]
            t2_ca_set = t2_ancestors[mutations[i]] & t2_ancestors[mutations[j]]

            total += jaccard(t1_ca_set, t2_ca_set)

    return total / (m * (m - 1) / 2)


def caset_intersection(t1, t2):
    """
    Compute the CASet distance between two trees, only summing over pairs of mutations in both trees.
    :param t1: a Newick string representation of tree 1
    :param t2: a Newick string representation of tree 2
    :return: the CASet intersection distance between tree 1 and tree 2
    """
    t1_ancestors = ancestor_sets(t1)
    t2_ancestors = ancestor_sets(t2)
    intersection = list(set(t1_ancestors.keys()) & set(t2_ancestors.keys()))

    return caset(intersection, t1_ancestors, t2_ancestors)


def caset_union(t1, t2):
    """
    Compute the CASet distance between two trees, summing over all pairs of mutations.
    :param t1: a Newick string representation of tree 1
    :param t2: a Newick string representation of tree 2
    :return: the CASet union distance between tree 1 and tree 2
    """
    t1_ancestors = ancestor_sets(t1)
    t2_ancestors = ancestor_sets(t2)
    union = list(set(t1_ancestors.keys()) | set(t2_ancestors.keys()))

    for u in union:
        if u not in t1_ancestors:
            t1_ancestors[u] = set()
        if u not in t2_ancestors:
            t2_ancestors[u] = set()

    return caset(union, t1_ancestors, t2_ancestors)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Find pairwise CASet distances of a set of trees.')
    parser.add_argument('inputFile')
    parser.add_argument('-o', '--outputFile')
    parser.add_argument('-u', '--union', action='store_true')
    parser.add_argument('-p', '--pickle')
    parser.add_argument('-t', '--treePrint', action='store_true')
    parser.add_argument('-m', '--minmax', action='store_true')
    args = parser.parse_args()

    trees = get_newicks(args.inputFile)

    if args.treePrint:
        for i, tree in enumerate(trees):
            print('Tree {}:\n{}\n'.format(i, tree))

    distance_measure = caset_union if args.union else caset_intersection
    distance_matrix = [[None for x in range(len(trees))] for y in range(len(trees))]
    for i, t1 in enumerate(trees):
        for j, t2 in enumerate(trees):
            distance_matrix[i][j] = distance_measure(t1, t2)
            distance_matrix[j][i] = distance_matrix[i][j]

    output = get_matrix_string(distance_matrix)

    if args.minmax:
        output += get_min_max_string(distance_matrix)

    if args.pickle:
        with open(args.pickle, 'wb') as out:
            pickle.dump(distance_matrix, out, pickle.HIGHEST_PROTOCOL)

    if args.outputFile:
        with open(args.outputFile, 'w') as out:
            out.write(output)
    else:
        print(output)
