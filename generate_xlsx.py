from openpyxl import Workbook

rows = [
    ("$G_LOAD_DATE", "datetime", "to_date(to_char(sysdate(),'yyyy.mm.dd HH24:mi:ss'),'yyyy.mm.dd HH24:mi:ss')"),
    ("$G_LOAD_WINDOW_BEGIN_DATE", "datetime", "2014.01.01"),
    ("$G_LOAD_WINDOW_END_DATE", "datetime", "to_date(to_char(sysdate(),'yyyy.mm.dd HH24:mi:ss'),'yyyy.mm.dd HH24:mi:ss')"),
    ("$G_LOAD_WINDOW_BEGIN_REVID", "decimal(10,0)", "-1"),
    ("$G_LOAD_WINDOW_END_REVID", "decimal(10,0)", "-1"),
    ("$G_LOAD_MODE", "varchar(10)", ""),
    ("$G_DEFAULT_TEXT", "varchar(1)", "?"),
    ("$G_DEFAULT_COMMENT", "varchar(1)", " "),
    ("$G_DEFAULT_DATE", "datetime", "1900.01.01"),
    ("$G_DEFAULT_NUMBER_ID", "int", "-1"),
    ("$G_DEFAULT_NUMBER_AMT", "int", "0"),
    ("$G_DEFAULT_NUMBER_FACTOR", "int", "1"),
    ("$G_DEFAULT_NUMBER_DONOTUSE", "int", "-999999999"),
    ("$G_DEFAULT_FLAG", "varchar(1)", "N"),
    ("$G_MAX_DATE", "datetime", "2999.12.31"),
    ("$G_DATASTORE_RANGE_BEGIN", "datetime", "1990.01.01"),
    ("$G_DATASTORE_RANGE_END", "datetime", "2035.12.31"),
    ("$G_TOP_LEVEL_DUMMY", "varchar(8)", "\\[ALL\\]"),
    ("$G_JOB_RESULT_RECIPIENTS", "varchar(250)", "dummy@bit.admin.ch"),
    ("$G_DEL_PERIOD", "datetime", "to_date((sysdate() - 180),'YYYY.MM.DD')"),
    ("$G_YOUTH_PROTOCOL_SAFETY", "datetime", "2014.01.01"),
]

wb = Workbook()
ws = wb.active
ws.title = "Global Variables"
ws.append(["Name", "Type", "Value"])
for r in rows:
    ws.append(list(r))

for col, width in zip("ABC", (35, 18, 70)):
    ws.column_dimensions[col].width = width

wb.save("global_variables.xlsx")
print("written")
