from psycopg2 import sql
from .helpers import fin_year_start
from datetime import datetime
import re

class FormValues:
    def __init__(self, form: dict):
        self.registrations = sql.Literal(list(
            map(lambda x: x["vehiclereg"], form["registrations"])
        ))
        # print(form["registrations"])
        self.fleetno = sql.Literal(list(map(lambda x: x["fleet_no"], form["registrations"])))
        self.julFromDate = sql.Literal(form["julFromDate"])
        self.julToDate = sql.Literal(form["julToDate"])
        self.julStartMonth = sql.Literal(form["julStartMonth"])
        self.julEndMonth = sql.Literal(form["julEndMonth"])
        self.division = sql.Literal(form["division"])
        self.vehicleType = sql.Literal(form["vehicleType"])
        self.models = sql.Literal(form["models"])
        self.components = sql.Literal(form["components"])
        self.suppliers = sql.Literal(form["suppliers"])
        self.branch = sql.Literal(form["branch"])
        self.julMonth = sql.Literal(form["julMonth"])
        self.month = sql.Literal(form["month"])     
        self.periodFilter= sql.Literal(form["periodFilter"])
        self.pavRegs = sql.Literal(form["pavRegs"])
        self.singleBranch = sql.Literal(form["branch_single"]["branch"])
        if form["julEndMonth"] != None:
            self.finYearStart = sql.Literal(fin_year_start(datetime.strptime(form["julEndMonth"], "%Y-%m-%d")))
        if form["pavRegs"] != [None]:
            self.singleReg = sql.Literal(get_pav_vehiclereg(form["pavRegs"]))


def get_pav_vehiclereg(input_string):
    # Use regular expression to find text inside parentheses
    match = re.search(r'\((.*?)\)', input_string)
    
    # Check if a match is found
    if match:
        return match.group(1)
    else:
        return None

class ordersactionsclass:
    def __init__(self):
        self.create = 'create'
        self.update = 'update'
        self.delete = 'delete'

    def get_action(self, action_string):
        if action_string == self.create:
            return self.create
        elif action_string == self.update:
            return self.update
        elif action_string == self.delete:
            return self.delete
        else:
            return None
