export interface asset {
  branch: string;
  chassis_no: string;
  client_acc_no: string;
  client_name: string;
  contract_mileage: number;
  contract_type: string;
  date_of_first_reg: string;
  deal_number: number;
  description: string;
  fleet_list_date: string;
  last_known_odo: string;
  maint_plan_cost: string;
  make: string;
  map: string;
  mm_code: string;
  months_remaining: number;
  new_used: string;
  pass_comm: string;
  truck_trailer: string;
  veh_model_map: string;
  veh_type_map: string;
  vehicle_cat: string;
  vehiclereg: string;
  icon?: string;
}

export const assetIcon: { [key in keyof asset]: string } = {
  branch: 'feed',
  chassis_no: 'feed',
  client_acc_no: 'feed',
  client_name: 'money-check-alt',
  contract_mileage: 'account_balance',
  contract_type: 'account_balance',
  date_of_first_reg: 'date_of_first_reg_icon',
  deal_number: 'deal_number_icon',
  description: 'description_icon',
  fleet_list_date: 'web_asset',
  last_known_odo: 'web_asset',
  maint_plan_cost: 'web_asset',
  make: 'make_icon',
  map: 'map',
  mm_code: 'mm_code_icon',
  months_remaining: 'dashboard',
  new_used: 'save',
  pass_comm: 'pmoney-check-alt',
  truck_trailer: 'map',
  veh_model_map: 'money-check-alt',
  veh_type_map: 'dashboard',
  vehicle_cat: 'account_balance',
  vehiclereg: 'web_asset',
};
