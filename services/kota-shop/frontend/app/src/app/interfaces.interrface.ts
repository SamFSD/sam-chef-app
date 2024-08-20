export interface division {
  division: string;
  branches: {};
}

export interface divisions {
  branches: string[];
  division: string;
  label: string;
}

export interface component_map {
  avg_costs: number;
  avg_costs_branch: number;
  avg_cpks: number;
  avg_cpks_branch: number;
  branch: string;
  component_map: string;
  costs: number;
  cpk: number;
  distance: string;
  max_ranking_branch: number;
  max_ranking_fleet: number;
  percentage_avg_costs: number;
  percentage_avg_costs_branch: number;
  percentage_avg_cpk: number;
  percentage_avg_cpk_branch: number;
  ranking_branch_costs: number;
  ranking_branch_cpk: number;
  ranking_fleet_costs: number;
  ranking_fleet_cpk: number;
  veh_model_map: string;
  vehiclereg: string;
}

export interface branch_component_cpks_data {
  div_avg: number;
  div_data: {
    component_map: string;
    branch: string;
    component_cost: number;
    distance: number;
    component_cpk: number;
    avg_component_cpk: number;
  };
}
// export interface BranchComponent {
//   branch: string;
//   div_avg: number;
//   div_data: {
//     branch: string;
//     component_cpk: number;
//   };
// }

// export interface branch_component_cpks {
//   [key: string]: branch_component_cpks_data;
// }

// export interface BranchComponent {
//   div_avg: number;
//   div_data: {
//     component_map: string;
//     branch: string;
//     component_cost: number;
//     distance: number;
//     component_cpk: number;
//     avg_component_cpk: number;
//   };
// }

export interface vehicle_distance_ranked {
  vehiclereg: string;
  branch: string;
  veh_model_map: string;
  asset_total: number;
  asset_daily_avg: number;
  branch_total: number;
  avg_daily_all_vehicles: number;
  total_all_vehicles: number;
  num_vehicles_per_branch: number;
  avg_total_dist_branch: number;
  avg_total_distance: number;
  avg_daily_distance_branch: number;
  avg_daily_distance_fleet: number;
  percentage_of_branch_avg_total: number;
  percentage_of_fleet_avg_total: number;
  percentage_of_branch_avg_daily: number;
  percentage_of_fleet_avg_daily: number;
  daily_avg_ranking_fleet: number;
  daily_avg_ranking_branch: number;
  total_avg_ranking_fleet: number;
  total_avg_ranking_branch: number;
  max_fleet_dist_ranking: number;
  max_branch_dist_ranking: number;
}

export interface vehicle_costs_ranked {
  vehiclereg: string;
  branch: string;
  veh_model_map: string;
  asset_total: number;
  asset_daily_avg: number;
  branch_total: number;
  avg_daily_all_vehicles: number;
  total_all_vehicles: number;
  num_vehicles_per_branch: number;
  avg_total_dist_branch: number;
  avg_total_distance: number;
  avg_daily_distance_branch: number;
  avg_daily_distance_fleet: number;
  percentage_of_branch_avg_total: number;
  percentage_of_fleet_avg_total: number;
  percentage_of_branch_avg_daily: number;
  percentage_of_fleet_avg_daily: number;
  daily_avg_ranking_fleet: number;
  daily_avg_ranking_branch: number;
  total_avg_ranking_fleet: number;
  total_avg_ranking_branch: number;
  max_fleet_dist_ranking: number;
  max_branch_dist_ranking: number;
}

export interface invoice_row {
  amount: number;
  component_cat: string;
  fleetbranch: string;
  labour_rate: 0;
  maintdescription: string;
  maintprodname: string;
  mapping: string;
  order_number: string;
  part_cost: number;
  part_price: number;
  productcat: string;
  quantity: number;
  savings: number;
  savings_reason: string;
  serviceprovider: string;
  transdate: string;
  vehdescription: string;
  vehiclereg: string;
  vehmake: string;
  vehmodel: string;
  vehtype: string;
  work_order_distance: number;
  work_order_id: number;
}


export interface DriverBIGauge {
  title: string;
  icon: string;
  value: number;
  count: number;
}
