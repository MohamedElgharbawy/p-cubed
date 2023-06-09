import sys, json
import csv
from matching.games import HospitalResident

def parse_student_csv(file_p):
    # student_preferences: Dict(str(student_id): ['section1', 'section2', ... (amount depending on student's availability -- varies)])
    # section_preferences: Dict(str(section_name): ['01', '02', ... (section chooses back students who include it in the pref)])
    # section_capacities: Dict(str(section_name): int -- room capacity)

    no_str = 'I have a schedule conflict which prevents me from attending other section times except for the one(s) listed as higher preferences'
    fields = []
    rows = []
    student_pref = {}
    section_pref = {}
    section_capa = {}
    
    with open(file_p, 'r') as csvfile:
        csvreader = csv.reader(csvfile)
        fields = next(csvreader)
        inv_fields = {v:i for i, v in enumerate(fields)}
        # extracting each data row one by one
        for i, row in enumerate(csvreader):
            if row[0]:
                student_id = str(i)
                student_pref[student_id] = []
                if row[inv_fields['First preference']] and row[inv_fields['First preference']] != no_str:
                    student_pref[student_id].append(row[inv_fields['First preference']])
                    if row[inv_fields['First preference']] not in section_pref:
                        section_pref[row[inv_fields['First preference']]] = [student_id]
                    else:
                        section_pref[row[inv_fields['First preference']]].append(student_id)
                if row[inv_fields['Second preference']] and row[inv_fields['Second preference']] != no_str:
                    student_pref[student_id].append(row[inv_fields['Second preference']])
                    if row[inv_fields['Second preference']] not in section_pref:
                        section_pref[row[inv_fields['Second preference']]] = [student_id]
                    else:
                        section_pref[row[inv_fields['Second preference']]].append(student_id)
                if row[inv_fields['Third preference']] and row[inv_fields['Third preference']] != no_str:
                    student_pref[student_id].append(row[inv_fields['Third preference']])
                    if row[inv_fields['Third preference']] not in section_pref:
                        section_pref[row[inv_fields['Third preference']]] = [student_id]
                    else:
                        section_pref[row[inv_fields['Third preference']]].append(student_id)
                if row[inv_fields['Fourth preference']] and row[inv_fields['Fourth preference']] != no_str:
                    student_pref[student_id].append(row[inv_fields['Fourth preference']])
                    if row[inv_fields['Fourth preference']] not in section_pref:
                        section_pref[row[inv_fields['Fourth preference']]] = [student_id]
                    else:
                        section_pref[row[inv_fields['Fourth preference']]].append(student_id)
                

    student_size = len(student_pref)
    section_size = len(section_pref)
    common = student_size // section_size
    remain = student_size % section_size
    
    for s in section_pref.keys():
        section_capa[s] = common
    
    for i in range(remain):
        section_capa[section_pref.keys()[i]] += 1

    return student_pref, section_pref, section_capa

def parse_input_pref(pref_in):
    # student_preferences: Dict(str(student_id): ['section1', 'section2', ... (amount depending on student's availability -- varies)])
    # section_preferences: Dict(str(section_name): ['01', '02', ... (section chooses back students who include it in the pref)])

    student_pref = {}
    section_pref = {}
    sid_name_map = {}
    
    for student in pref_in:
        name = student['Name']
        sid = student['SID']
        sid_name_map[sid] = name

        student_pref[sid] = []
        for k in student['Sections']:
            if student['Sections'][k] == 'Highly prefer':
                student_pref[sid].append(k)
                if k not in section_pref:
                    section_pref[k] = [sid]
                else:
                    section_pref[k].append(sid)
            elif student['Sections'][k] == 'Can make it':
                student_pref[sid].append(k)
                if k not in section_pref:
                    section_pref[k] = [sid]
                else:
                    section_pref[k].append(sid)
            elif student['Sections'][k] == 'Do not prefer but can make it':
                student_pref[sid].append(k)
                if k not in section_pref:
                    section_pref[k] = [sid]
                else:
                    section_pref[k].append(sid)           

    return student_pref, section_pref, sid_name_map

def format_output(matching, sid_name_map):
    meta_matching = {}

    for section, students in matching.items():
        meta_matching[section] = [{'Name': sid_name_map[sid], 'SID': sid} for sid in students]
    
    return meta_matching


def allocated_unmatched(matching, section_capa, student_lst):
    # allocate the unmatched
    matched_students = []
    for section, students in matching.items():
        for student in students:
            matched_students.append(student)
    unmatched_students = list(set(student_lst) - set(matched_students))

    pt = 0
    for section, students in matching.items():
        room_capa = section_capa[section]
        if len(students) < room_capa:
            opening = room_capa - len(students)
            matching[section].extend(unmatched_students[pt:pt+opening])
            pt += opening
    
    return matching

def stringfy_result(matching):
    str_m = {}
    for section, students in matching.items():
        str_m[section.name] = [s.name for s in students]
    return str_m


# pref_data = json.loads(next(sys.stdin).strip())
# capacity = json.loads(next(sys.stdin).strip())
data = json.loads(next(sys.stdin).strip())
pref_data = data["prefData"]
capacity = {k: int(v) for k, v in data["capacity"].items()}
# with open("output.txt", "a") as f:
#     f.write(repr(pref_data) + "\n")
#     f.write(repr(capacity) + "\n")

student_pref, section_pref, sid_name_map = parse_input_pref(pref_data)
game = HospitalResident.create_from_dictionaries(student_pref, section_pref, capacity)
matching = game.solve(optimal="resident") #return a Dict(section_name: List[student_id])
assert game.check_validity()
assert game.check_stability()

str_matching = stringfy_result(matching)
balanced_matching = allocated_unmatched(str_matching, capacity, student_pref.keys())
output = format_output(balanced_matching, sid_name_map)

print(json.dumps(output))
