
"""
DEPRECATED, PLEASE DON'T DELETE YET
"""
# def get_fleetlist(
#     from_date: str, to_date: str, division: str, branch: str, veh_type: str
# ):
#     division_filter, branch_filter, type_filter = div_branch_type_filter_check(
#         division, branch, veh_type
#     )
#     date_condition = date_filter(from_date, to_date)

#     # end_date = datetime.strptime('2023-04-30', "%Y-%m-%d")
#     # start_date = datetime.strptime('2023-01-30', "%Y-%m-%d")
#     # end_date = '2023-04-30'
#     # start_date = '2023-01-30'
#     query_list = []
#     """Return dataframe of fleetlist table
#     filtered by date.
#     Second query does estimate of trailer kms for period by dividing total truck kms by total trailer count
#     """
#     query_list = []
#     period_days_delta = (
#         datetime.strptime(from_date, "%Y-%m-%d")
#         - datetime.strptime(to_date, "%Y-%m-%d")
#     ).days

#     # if transrite_toggle:

#     fleet_list_query = sql.SQL(
#         """COPY
#             (
#         select new_used, fleetlist.fleet_no, veh_type_map, fleetlist.vehiclereg,
#                         contract_type, months_remaining, branch,
#                         make, veh_model_map, dist.dist, tdist.tdist, blable.billable_maint,
#                         (case when contract_mileage = 0 then 0 else (maint_plan_cost/contract_mileage) end) as expected_plan_cpk,
#                         maint_plan_cost/30 as daily_maint_plan, last_known_odo, card.tolls, card.fuel

#                         from fleet.fleetlist


#             left join (select vehiclereg, sum(distance) as dist
#                         from fleet.x_dist_per_day_asset
#                         where day_of {date_condition}
#                         group by vehiclereg) as dist on dist.vehiclereg = fleetlist.vehiclereg
#             left join (select vehiclereg, sum(distance) as tdist
#                         from fleet.x_dist_per_day_trailer
#                      where day_of {date_condition}

#                         group by vehiclereg) as tdist on tdist.vehiclereg = fleetlist.vehiclereg
#             left join (select vehiclereg, sum(cost) as billable_maint from fleet.x_component_cost_per_day_asset
#                     where day_of {date_condition}
#                     group by vehiclereg) as blable on blable.vehiclereg = fleetlist.vehiclereg
#             left join (select vehiclereg, sum(case when upper(transaction_type) = 'TOLL' then transaction_cost else 0 end)
#                     as tolls,
#                     sum(case when upper(transaction_type) = 'FUEL' then transaction_cost else 0 end)
#                     as fuel from fleet.fleet_card where transaction_date {date_condition}
#                     group by vehiclereg) card on card.vehiclereg
#                     = fleetlist.vehiclereg
#                     where lower(division) = {division}and lower(branch) = {branch} and lower(veh_type_map) = {veh_type}
#             )
#              TO STDOUT WITH CSV HEADER"""
#     ).format(
#         date_condition=date_filter(from_date, to_date),
#         division=division_filter,
#         branch=branch_filter,
#         veh_type=type_filter,
#     )
#     # logger.info(fleet_list_query)
#     query_list.append(fleet_list_query)

#     # query_list.append(trailer_dist_query)
#     # try:
#     response_list = exc_qrs_get_dfs_raw(query_list)
#     # trailer_kms_dict = response_list[1].to_dict(orient="records")
#     response_df = response_list[0].replace("", 0).fillna(0)

#     response_df["dist"] = (
#         response_df["dist"].astype(float).round()
#         + response_df["tdist"].astype(float).round()
#     )
#     response_df["billable_cpk"] = round(
#         response_df.billable_maint.astype(float) / response_df["dist"], 2
#     )
#     response_df["fuel_cpk"] = round(
#         response_df.fuel.astype(float) / response_df["dist"], 2
#     )
#     response_df["toll_cpk"] = round(
#         response_df.tolls.astype(float) / response_df["dist"], 2
#     )
#     response_df["daysdelta"] = period_days_delta
#     response_df["maint_plan"] = (
#         response_df.daily_maint_plan.astype(float) * response_df.daysdelta
#     )
#     response_df["plan_cpk"] = round(
#         response_df["maint_plan"].astype(float) / response_df["dist"], 2
#     )
#     response_df["dist"] = response_df["dist"].astype(float).round()
#     response_df["expected_plan_cpk"] = round(
#         response_df["expected_plan_cpk"].astype(float).round(2), 2
#     )
#     response_df["maint_cpk"] = response_df["billable_cpk"].astype(float) + response_df[
#         "plan_cpk"
#     ].astype(float)
#     response_df["total_cpk"] = (
#         response_df["toll_cpk"].astype(float)
#         + response_df["fuel_cpk"].astype(float)
#         + response_df["maint_cpk"].astype(float)
#     )

#     header_table_df = response_df.copy()
#     # header_table_df = response_df[
#     #     ["branch", "dist", "veh_type_map", "billable_maint", "maint_plan"]
#     # ]
#     response_df.drop(
#         ["maint_plan", "billable_maint", "daysdelta", "tdist", "fuel", "tolls"],
#         axis=1,
#         inplace=True,
#     )
#     header_table_df.drop(
#         ["daysdelta", "tdist", "toll_cpk", "fuel_cpk", "total_cpk", "fuel", "tolls"],
#         axis=1,
#         inplace=True,
#     )

#     response_df = response_df[
#         [
#             "new_used",
#             "veh_type_map",
#             "make",
#             "veh_model_map",
#             "fleet_no",
#             # "description",
#             "vehiclereg",
#             "contract_type",
#             "months_remaining",
#             "branch",
#             # "chassis_no",
#             "last_known_odo",
#             "dist",
#             "expected_plan_cpk",
#         ]
#     ]
#     response_df = response_df.replace([np.inf, -np.inf, np.nan], None)
#     # logger.info(response_df)
#     # except Exception as error:
#     #     logger.info(error)
#     #     return error

#     # return response_df, header_table_df

#     # response_df = response_df.reset_index(drop=True)

#     return response_df.to_dict("records")




# @router.get("/test", description="Test get of fleetlist", tags=["Yo!"])
# def test():
#     try:
#         # to_date = datetime.strptime('2023-04-30', "%Y-%m-%d")
#         # start_date = datetime.strptime('2023-01-30', "%Y-%m-%d")
#         to_date = "2023-04-30"
#         start_date = "2023-01-30"
#         branches_to_filter_on = ""
#         query_list = []
#         """Return dataframe of fleetlist table
#         filtered by date.
#         Second query does estimate of trailer kms for period by dividing total truck kms by total trailer count
#         """
#         query_list = []
#         period_days_delta = (
#             datetime.strptime(to_date, "%Y-%m-%d")
#             - datetime.strptime(start_date, "%Y-%m-%d")
#         ).days

#         # if transrite_toggle:
#         fleet_list_query = (
#             """COPY 
#                 (
#                 select new_used, veh_type_map, fleetlist.vehiclereg,
#                             contract_type, months_remaining, branch, 
#                             make, veh_model_map, dist.dist, tdist.tdist, blable.billable_maint, 
#                             (case when contract_mileage = 0 then 0 else (maint_plan_cost/contract_mileage) end) as expected_plan_cpk,
#                             maint_plan_cost/30 as daily_maint_plan, last_known_odo, card.tolls, card.fuel
#                             from fleet.fleetlist

#                 left join (select vehiclereg, sum(distance) as dist
#                             from fleet.x_dist_per_day_asset
#                             where day_of::date between '{from_date}' and '{to_date}'
#                             group by vehiclereg) as dist on dist.vehiclereg = fleetlist.vehiclereg
#                 left join (select vehiclereg, sum(distance) as tdist
#                             from fleet.x_dist_per_day_trailer
#                             where day_of::date between '{from_date}' and '{to_date}'
#                             group by vehiclereg) as tdist on tdist.vehiclereg = fleetlist.vehiclereg
#             left join (select vehiclereg, sum(cost) as billable_maint from fleet.x_component_cost_per_day_asset
#                     where day_of::date between '{from_date}' and '{to_date}'
#                     group by vehiclereg) as blable on blable.vehiclereg = fleetlist.vehiclereg
#             left join (select vehiclereg, sum(case when upper(transaction_type) = 'TOLL' then transaction_cost else 0 end)
#                     as tolls,
#                     sum(case when upper(transaction_type) = 'FUEL' then transaction_cost else 0 end)
#                     as fuel from fleet.fleet_card where transaction_date::date between '{from_date}' and '{to_date}'
#                     group by vehiclereg) card on card.vehiclereg 
#                     = fleetlist.vehiclereg
#                     where branch = any(array(select branches from fleet.divisions where lower(division) = '{filtered_division}'))
#             )
#                   TO STDOUT WITH CSV HEADER"""
#         ).format(
#             start_date=start_date,
#             to_date=to_date,
#             # transrite_branch_array=branches_to_filter_on,
#             filtered_division="transrite",
#         )
#         # logger.info(fleet_list_query)
#         query_list.append(fleet_list_query)

#         # query_list.append(trailer_dist_query)
#         # try:
#         response_list = exc_qrs_get_dfs_raw(query_list)
#         # trailer_kms_dict = response_list[1].to_dict(orient="records")
#         response_df = response_list[0].replace("", 0).fillna(0)
#         # logger.info(response_df)
#         response_df["dist"] = (
#             response_df["dist"].astype(float).round()
#             + response_df["tdist"].astype(float).round()
#         )
#         response_df["billable_cpk"] = round(
#             response_df.billable_maint.astype(float) / response_df["dist"], 2
#         )
#         response_df["fuel_cpk"] = round(
#             response_df.fuel.astype(float) / response_df["dist"], 2
#         )
#         response_df["toll_cpk"] = round(
#             response_df.tolls.astype(float) / response_df["dist"], 2
#         )
#         response_df["daysdelta"] = period_days_delta
#         response_df["maint_plan"] = (
#             response_df.daily_maint_plan.astype(float) * response_df.daysdelta
#         )
#         response_df["plan_cpk"] = round(
#             response_df["maint_plan"].astype(float) / response_df["dist"], 2
#         )
#         response_df["dist"] = response_df["dist"].astype(float).round()
#         response_df["expected_plan_cpk"] = round(
#             response_df["expected_plan_cpk"].astype(float).round(2), 2
#         )
#         response_df["maint_cpk"] = response_df["billable_cpk"].astype(
#             float
#         ) + response_df["plan_cpk"].astype(float)
#         response_df["total_cpk"] = (
#             response_df["toll_cpk"].astype(float)
#             + response_df["fuel_cpk"].astype(float)
#             + response_df["maint_cpk"].astype(float)
#         )

#         header_table_df = response_df.copy()
#         # header_table_df = response_df[
#         #     ["branch", "dist", "veh_type_map", "billable_maint", "maint_plan"]
#         # ]
#         response_df.drop(
#             ["maint_plan", "billable_maint", "daysdelta", "tdist", "fuel", "tolls"],
#             axis=1,
#             inplace=True,
#         )
#         header_table_df.drop(
#             [
#                 "daysdelta",
#                 "tdist",
#                 "toll_cpk",
#                 "fuel_cpk",
#                 "total_cpk",
#                 "fuel",
#                 "tolls",
#             ],
#             axis=1,
#             inplace=True,
#         )

#         response_df = response_df[
#             [
#                 "new_used",
#                 "veh_type_map",
#                 "make",
#                 "veh_model_map",
#                 # "description",
#                 "vehiclereg",
#                 "contract_type",
#                 "months_remaining",
#                 "branch",
#                 # "chassis_no",
#                 "last_known_odo",
#                 "dist",
#                 "billable_cpk",
#                 "expected_plan_cpk",
#                 "plan_cpk",
#                 "maint_cpk",
#                 "toll_cpk",
#                 "fuel_cpk",
#                 "total_cpk",
#             ]
#         ]
#         response_df = response_df.replace([np.inf, -np.inf, np.nan], None)

#         # except Exception as error:
#         #     logger.info(error)
#         #     return error

#         # return response_df, header_table_df

#     except Exception as e:
#         print(f"An error occurred: {e}")
#         raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
#     return response_df.to_dict("records")





# @router.get(
#     "/dl_orders_file",
#     description="Downloads orders matching the KZN order file format",
#     tags=["Orders Grid"],
# )
# def dl_orders_file(date: str, branch: str):
#     query = sql.SQL(
#         """COPY(
#                     SELECT quote_no, date AS quote_date, order_no, date AS order_date, service_provider, vehiclereg, fleet_no, odo, repair_type, description, amount
#                     FROM fleet.orders
#                     WHERE LOWER(branch) = {branch}
#                     AND julian_month = {date}
#                     ORDER BY order_no ASC
#     )TO STDOUT WITH CSV HEADER
#                     """
#     ).format(branch=sql.Literal(branch), date=sql.Literal(date))

#     results = put_dates_in_dumb_format(exc_qrs_get_dfs_raw([query])[0])
#     csv = results.to_csv(index=False).encode("utf-8")

#     content_disposition = 'attachment; filename="{branch}.csv"'.format(
#         branch=sql.Literal(branch)
#     )
#     headers = {"Content-Disposition": content_disposition}

#     return Response(
#         csv,
#         media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
#         headers=headers,
#     )


# date formmater




# def log_update(user: str, data: dict, table: str):
#     time = datetime.now()
#     time = time.strftime("%Y-%m-%d %H:%M:%S")
#     order_no = data["order_no"]
#     row = json.dumps(data)
#     select_row = (
#         """
#     COPY(
#     SELECT *
#     FROM fleet.{table}
#     WHERE order_no = '{order_no}'
#     ) TO STDOUT WITH CSV HEADER
#     """
#     ).format(order_no=order_no, table=table)

#     select_row = sql.SQL(select_row)

#     results = exc_qrs_get_dfs_raw([select_row])[0].to_dict("records")
#     old_row = json.dumps(results[0])

#     log = """
#         INSERT INTO fleet.logs (datetime, "user", rows, changes, transaction, "table")
#         VALUES (
#             '{time}',
#             '{user}',          
#             '{old_row}',
#             '{row}',
#             'update',
#             '{table}'
#         )
#         """.format(
#         time=time, user=user, old_row=old_row, row=row, table=table
#     )
#     log = sql.SQL(log)
#     exec_query(log)


# def log_create(user: str, data: dict, table: str):
#     time = datetime.now()
#     time = time.strftime("%Y-%m-%d %H:%M:%S")
#     data = json.dumps(data)

#     log = """
#         INSERT INTO fleet.logs (datetime, "user", changes, transaction, "table")
#         VALUES (
#             '{time}',
#             '{user}',
#             '{data}',
#             'create',
#             '{table}'
#         )
#         """.format(
#         time=time, user=user, data=data, table=table
#     )
#     exec_query(log)


# def log_delete(user: str, data: List[str], table: str):
#     time = datetime.now()
#     time = time.strftime("%Y-%m-%d %H:%M:%S")
#     log_rows = (
#         """
#         COPY(
#         SELECT *
#         FROM fleet.orders
#         WHERE order_no = ANY(ARRAY{data})
#         UNION
#         SELECT *
#         FROM fleet.orders_non_miles
#         WHERE order_no = ANY(ARRAY{data})
#         )TO STDOUT WITH CSV HEADER
#         """
#     ).format(data=data)
#     log_rows = sql.SQL(log_rows)
#     results = exc_qrs_get_dfs_raw([log_rows])[0].to_dict("records")
#     deleted_rows = json.dumps(results)
#     log = """
#     INSERT INTO fleet.logs (datetime, "user", rows, transaction, "table")
#     VALUES (
#         '{time}',
#         '{user}',
#         '{deleted_rows}',
#         'delete',
#         '{table}'
#     )
#     """.format(
#         time=time, user=user, deleted_rows=deleted_rows, table=table
#     )
#     log = sql.SQL(log)
#     exec_query(log)

#################################################################
#This shit was just loose in the PAV API, no endpoints attached.#
#################################################################
# def julian_date_range(date):
#     query = sql.SQL(
#         """COPY(
#                     SELECT jul_from_date, jul_to_date FROM fleet.julian_cal 
#                     where {date} between jul_from_date and jul_to_date
#     )TO STDOUT WITH CSV HEADER"""
#     ).format(date=sql.Literal(date))
#     res = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
#     from_date = res[0]["jul_from_date"]
#     to_date = res[0]["jul_to_date"]

#     return from_date, to_date

# def write_to_file_accrual_report(
#     from_date: str, to_date: str, division: str, branch: str, veh_type: str
# ):
#     con = return_connection()

#     pivot_service_provider = f"""SELECT            
#     serviceprovider,
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 1 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Jan 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 2 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Feb 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 3 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Mar 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 4 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Apr 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 5 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "May 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 6 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Jun 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 7 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Jul 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 8 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Aug 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 9 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Sep 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 10 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Oct 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 11 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Nov 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 12 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Dec 2023",
#     SUM(amount) AS "Total"
#     FROM fleet.maintenance
#         GROUP BY 
#             ROLLUP (serviceprovider)
#         ORDER BY 
#     serviceprovider"""

#     shp_query = f"""SELECT * FROM fleet.maintenance where 
#     lower(division) = '{division}' and lower(branch) = '{branch}' and 
#     lower(veh_type_map) = '{veh_type} 'and transdate between '{from_date}' and '{to_date}'
#       """
#     pivot_branch = f"""SELECT            
#     branch,
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 1 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Jan 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 2 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Feb 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 3 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Mar 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 4 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Apr 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 5 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "May 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 6 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Jun 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 7 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Jul 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 8 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Aug 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 9 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Sep 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 10 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Oct 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 11 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Nov 2023",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 12 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Dec 2023",
#     SUM(amount) AS "Total"
#         FROM fleet.maintenance
#         GROUP BY 
#             ROLLUP (branch)
#         ORDER BY 
#     branch"""

#     comparison_query = f"""	
#       SELECT            
#         veh_type_map,
#         SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 1 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Jan 2023",
#         SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 2 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Feb 2023",
#         SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 3 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Mar 2023",
#         SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 4 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Apr 2023",
#         SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 5 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "May 2023",
#         SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 6 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Jun 2023",
#         SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 7 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Jul 2023",
#         SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 8 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Aug 2023",
#         SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 9 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Sep 2023",
#         SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 10 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Oct 2023",
#         SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 11 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Nov 2023",
#         SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 12 AND EXTRACT(YEAR FROM transdate) = 2023 THEN amount ELSE 0 END) AS "Dec 2023",
#         SUM(amount) AS "Total"
#     FROM fleet.maintenance
#     WHERE
#     	veh_type_map in ('Passenger Car', 'Medium Commercial Vehicle','Light Commercial Vehicle', 'Heavy Commercial Vehicle' )

#     GROUP BY 
#         ROLLUP (veh_type_map) 
#     ORDER BY 
#         veh_type_map"""

#     comparison_query_diff = f"""select	
#           veh_type_map,
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 1 AND EXTRACT(YEAR FROM transdate) = 2022 THEN amount ELSE 0 END) AS "Jan 2022",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 2 AND EXTRACT(YEAR FROM transdate) = 2022 THEN amount ELSE 0 END) AS "Feb 2022",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 3 AND EXTRACT(YEAR FROM transdate) = 2022 THEN amount ELSE 0 END) AS "Mar 2022",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 4 AND EXTRACT(YEAR FROM transdate) = 2022 THEN amount ELSE 0 END) AS "Apr 2022",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 5 AND EXTRACT(YEAR FROM transdate) = 2022 THEN amount ELSE 0 END) AS "May 2022",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 6 AND EXTRACT(YEAR FROM transdate) = 2022 THEN amount ELSE 0 END) AS "Jun 2022",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 7 AND EXTRACT(YEAR FROM transdate) = 2022 THEN amount ELSE 0 END) AS "Jul 2022",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 8 AND EXTRACT(YEAR FROM transdate) = 2022 THEN amount ELSE 0 END) AS "Aug 2022",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 9 AND EXTRACT(YEAR FROM transdate) = 2022 THEN amount ELSE 0 END) AS "Sep 2022",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 10 AND EXTRACT(YEAR FROM transdate) = 2022 THEN amount ELSE 0 END) AS "Oct 2022",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 11 AND EXTRACT(YEAR FROM transdate) = 2022 THEN amount ELSE 0 END) AS "Nov 2022",
#     SUM(CASE WHEN EXTRACT(MONTH FROM transdate) = 12 AND EXTRACT(YEAR FROM transdate) = 2022 THEN amount ELSE 0 END) AS "Dec 2022",
#     SUM(amount) AS "Total"
#     FROM fleet.maintenance
#     WHERE
#     	veh_type_map in ('Passenger Car', 'Medium Commercial Vehicle','Light Commercial Vehicle', 'Heavy Commercial Vehicle' )

#     GROUP BY 
#         ROLLUP (veh_type_map) 
#     ORDER BY 
#         veh_type_map"""

#     comparison_query = pd.read_sql_query(
#         comparison_query, con
#     )  ## comparision query (passenger + commercial)
#     comparison_query_diff = pd.read_sql_query(
#         comparison_query_diff, con
#     )  ## comparision query (passenger + commercial)

#     pivot_sheet2 = pd.read_sql_query(pivot_branch, con)  ## branches
#     pivot_sheet = pd.read_sql_query(pivot_service_provider, con)  ### servive providers
#     ## shoprite transactions orders
#     data_sheet4 = pd.read_sql_query(shp_query, con)
#     ### accrual orders

#     try:
#         template_path = "/app/app/reports_templates/accrual_report_template.xlsx"
#         workbook = openpyxl.load_workbook(template_path)

#         sheet_name = "Data"
#         if sheet_name in workbook.sheetnames:
#             sheet = workbook[sheet_name]
#         else:
#             raise ValueError(f"Sheet '{sheet_name}' not found in the workbook.")

#         start_row = 2
#         start_column = 1

#         for col_num, header in enumerate(data_sheet4.columns, start_column):
#             sheet.cell(row=2, column=col_num, value=header)

#         for row_num, (_, row_data) in enumerate(data_sheet4.iterrows(), start_row):
#             for col_num, header in enumerate(data_sheet4.columns, start_column):
#                 value = row_data[header]
#                 sheet.cell(row=row_num, column=col_num, value=value)

#         workbook.save(template_path)
#         # print("Data written to spreadsheet successfully!")

#         template_path = "/app/app/reports_templates/accrual_report_template.xlsx"
#         workbook = openpyxl.load_workbook(template_path)

#         sheet_name = "Pivot"
#         if sheet_name in workbook.sheetnames:
#             sheet = workbook[sheet_name]
#         else:
#             raise ValueError(f"Sheet '{sheet_name}' not found in the workbook.")

#         start_row = 3
#         start_column = 1

#         for col_num, header in enumerate(pivot_sheet.columns, start_column):
#             sheet.cell(row=2, column=col_num, value=header)

#         for row_num, (_, row_data) in enumerate(pivot_sheet.iterrows(), start_row):
#             for col_num, header in enumerate(pivot_sheet.columns, start_column):
#                 value = row_data[header]
#                 sheet.cell(row=row_num, column=col_num, value=value)

#         workbook.save(template_path)
#         # print("Data written to spreadsheet successfully!")

#         template_path = "/app/app/reports_templates/accrual_report_template.xlsx"
#         workbook = openpyxl.load_workbook(template_path)

#         sheet_name = "Pivot"
#         if sheet_name in workbook.sheetnames:
#             sheet = workbook[sheet_name]
#         else:
#             raise ValueError(f"Sheet '{sheet_name}' not found in the workbook.")

#         start_row = 3
#         start_column = 17

#         start_column = 17

#         for col_num, header in enumerate(pivot_sheet2.columns, start_column):
#             sheet.cell(row=2, column=col_num, value=header)

#         for row_num, (_, row_data) in enumerate(pivot_sheet2.iterrows(), start_row):
#             for col_num, header in enumerate(pivot_sheet2.columns, start_column):
#                 value = row_data[header]
#                 sheet.cell(row=row_num, column=col_num, value=value)

#         workbook.save(template_path)
#         # print("Data written to spreadsheet successfully!")

#         template_path = "/app/app/reports_templates/accrual_report_template.xlsx"
#         workbook = openpyxl.load_workbook(template_path)

#         sheet_name = "Comparison"
#         if sheet_name in workbook.sheetnames:
#             sheet = workbook[sheet_name]
#         else:
#             raise ValueError(f"Sheet '{sheet_name}' not found in the workbook.")

#         start_row = 2
#         start_column = 1

#         start_column = 1

#         for col_num, header in enumerate(comparison_query.columns, start_column):
#             sheet.cell(row=2, column=col_num, value=header)

#         for row_num, (_, row_data) in enumerate(comparison_query.iterrows(), start_row):
#             for col_num, header in enumerate(comparison_query.columns, start_column):
#                 value = row_data[header]
#                 sheet.cell(row=row_num, column=col_num, value=value)

#         workbook.save(template_path)
#         # print("Data written to spreadsheet successfully!")

#         template_path = "/app/app/reports_templates/accrual_report_template.xlsx"
#         workbook = openpyxl.load_workbook(template_path)

#         sheet_name = "Comparison"
#         if sheet_name in workbook.sheetnames:
#             sheet = workbook[sheet_name]
#         else:
#             raise ValueError(f"Sheet '{sheet_name}' not found in the workbook.")

#         start_row = 14
#         start_column = 1

#         start_column = 1

#         for col_num, header in enumerate(comparison_query_diff.columns, start_column):
#             sheet.cell(row=2, column=col_num, value=header)

#         for row_num, (_, row_data) in enumerate(
#             comparison_query_diff.iterrows(), start_row
#         ):
#             for col_num, header in enumerate(
#                 comparison_query_diff.columns, start_column
#             ):
#                 value = row_data[header]
#                 sheet.cell(row=row_num, column=col_num, value=value)

#         workbook.save(template_path)
#         # print("Data written to spreadsheet successfully!")

#     except Exception as e:
#         print(f"Error: {e}")
#         raise
