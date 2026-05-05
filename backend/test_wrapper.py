import json
import os
from gridedge_wrapper import solve_case


def main():
    path = os.path.join(os.path.dirname(__file__), '..', 'motor-c', 'cases', 'ieee9.json')
    with open(path) as f:
        case = json.load(f)
    res = solve_case(case)
    print(json.dumps(res, indent=2))


if __name__ == '__main__':
    main()
