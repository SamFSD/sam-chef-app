from datetime import datetime
from typing import List, Any
from pydantic import BaseModel
import pandas as pd

# https://plotly.com/javascript/reference/
class Line(BaseModel):
    x: List[int]
    y: List[int]
    type: str
    name: str | None


class Bar(BaseModel):
    x: List[Any]
    y: List[Any]
    type: str
    name: str | None


class Pie(BaseModel):
    values: List[Any]
    labels: List[Any]
    type: str
    name: str | None

class veh_type_map_count(BaseModel):
    veh_type_map: str
    unit_count: int


class fleetlistSchema(BaseModel):
    vehiclereg: str
    deal_number: int
    client_acc_no: str
    client_name: str
    contract_type: str
    branch: str
    chassis_no: str
    mm_code:str
    vehicle_cat: str
    make: str
    description: str
    fleet_list_date: str
    pass_comm: str
    map: str
    truck_trailer: str
    new_used: str
    maint_plan_cost: str
    contract_mileage: str
    veh_model_map: str
    veh_type_map: str
    date_of_first_reg: str
    last_known_odo: str
    months_remaining: int