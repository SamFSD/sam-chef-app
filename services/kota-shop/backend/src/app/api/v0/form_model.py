from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import re
from .helpers import fin_year_start
from psycopg2 import sql

# class FormModel(BaseModel):
#     registrations: List[str]
#     fleetno: List[str]
#     julFromDate: str
#     julToDate: str
#     julStartMonth: str
#     julEndMonth: str
#     division: str
#     vehicleType: str
#     models: str
#     components: str
#     suppliers: str
#     branch: str
#     julMonth: str
#     month: str
#     periodFilter: str
#     pavRegs: Optional[str]
#     singleBranch: Optional[str]
#     finYearStart: Optional[str] = None
#     singleReg: Optional[str] = None

#     def process_data(self):
#         # This is where you can process the data into SQL literals
#         # Example:
#         processed_registrations = sql.Literal(self.registrations)
#         # similarly for other fields

#         if self.julEndMonth:
#             self.finYearStart = sql.Literal(fin_year_start(datetime.strptime(self.julEndMonth, "%Y-%m-%d")))

#         if self.pavRegs != [None]:
#             self.singleReg = sql.Literal(get_pav_vehiclereg(self.pavRegs))


# def get_pav_vehiclereg(input_string):
#     # Use regular expression to find text inside parentheses
#     match = re.search(r"\((.*?)\)", input_string)

#     # Check if a match is found
#     if match:
#         return match.group(1)
#     else:
#         return None
