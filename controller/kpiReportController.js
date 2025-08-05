const Joi = require("joi");

const { getSelectedColumn } = require("../models/common");
const kpiModel = require("../models/kpiReport");

exports.kpiInventory = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.object({
            facilities: Joi.string().allow("").required(),
            year: Joi.string().allow("").required(),
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;

            let finalyear = "";
            let finalyeardata = "2";
            let where = ` where user_id = '${user_id}'`;
            const financialyear = await getSelectedColumn(
                "financial_year_setting",
                where,
                "*"
            );
            if (financialyear.length > 0) {
                let final_year = financialyear[0].financial_year;
                if (final_year == "2") {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "2";
                } else {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "1";
                }
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            }
            let month = finalyear;
            let monthlyData = {};
            let monthlyData1 = {};
            let monthlyData2 = {};
            month.forEach((month) => {
                monthlyData[month] = null;
                monthlyData1[month] = null;
                monthlyData2[month] = null;
            });
            let array = [];
            let array1 = [];
            let array2 = [];
            let array3 = [];
            let scope1month = [];
            let scope1 = [];
            let scope2month = [];
            let scope3month = [];
            let scope2 = [];
            let scope3 = [];

            let categorydata,
                categorydata2,
                categorydata3,
                categorydata4,
                categorydata5,
                categorydata6,
                categorydata7,
                categorydata8,
                categorydata9,
                categorydata10,
                categorydata11,
                categorydata12,
                categorydata13,
                categorydata14,
                categorydata15,
                categorydata16,
                categorydata17,
                categorydata18,
                categorydata19,
                categorydata20,
                categorydata21 = "";
            let sum = 0;
            let sum1 = 0;
            let sum2 = 0;
            if (facilities) {
                let facilitiesdata = "";
                if (facilities != "0") {
                    facilitiesdata = facilities.replace(/\[|\]/g, "");
                } else {
                    facilitiesdata = "0";
                }

                categorydata = await kpiModel.getCombustionEmission(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata2 = await kpiModel.Allrefrigerants(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata3 = await kpiModel.Allfireextinguisher(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata4 = await kpiModel.getAllcompanyownedvehicles(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                array1 = [
                    ...categorydata,
                    ...categorydata2,
                    ...categorydata3,
                    ...categorydata4,
                ];
                if (array1) {
                    await Promise.all(
                        array1.map(async (item) => {
                            if (
                                item.month_number &&
                                monthlyData.hasOwnProperty(item.month_number)
                            ) {
                                monthlyData[item.month_number] += parseFloat(item.emission) || null;
                                let emissionFixed = parseFloat(item.emission) || null;
                                sum += emissionFixed || 0;
                            }
                        })
                    );
                    scope1month.push(Object.keys(monthlyData));
                    scope1.push(Object.values(monthlyData).map((num) => num !== null ? parseFloat(num / 1000).toFixed(3) : null));
                }

                categorydata5 = await kpiModel.getAllelectricity(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata6 = await kpiModel.getAllheatandsteam(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                array2 = [...categorydata5, ...categorydata6];
                if (array2) {
                    await Promise.all(
                        array2.map(async (item) => {
                            if (
                                item.month_number &&
                                monthlyData1.hasOwnProperty(item.month_number)
                            ) {
                                monthlyData1[item.month_number] += parseFloat(item.emission) || null;
                                let emissionFixed = parseFloat(item.emission) || null;
                                sum1 += emissionFixed || 0;
                                // Add emission value to the corresponding month
                            }
                        })
                    );
                    scope2month.push(Object.keys(monthlyData1));
                    scope2.push(Object.values(monthlyData1).map((num) => num !== null ? parseFloat(num / 1000).toFixed(3) : null));
                }
                categorydata7 = await kpiModel.purchaseGoodsDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata8 = await kpiModel.flight_travelDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                let hotelstayDetails = await kpiModel.hotel_stayDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                let othermodes_of_transportDetails =
                    await kpiModel.other_modes_of_transportDetails(
                        facilitiesdata,
                        year,
                        finalyeardata
                    );

                categorydata9 = await kpiModel.processing_of_sold_products_categoryDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata10 = await kpiModel.sold_product_categoryDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata11 = await kpiModel.endoflife_waste_typeDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata12 = await kpiModel.water_supply_treatment_categoryDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );

                categorydata13 = await kpiModel.employee_commuting_categoryDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata14 = await kpiModel.homeoffice_categoryDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata15 = await kpiModel.waste_generated_emissionsDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );

                categorydata16 = await kpiModel.upstreamLease_emissionDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata17 = await kpiModel.downstreamLease_emissionDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata18 = await kpiModel.franchise_categories_emissionDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata19 = await kpiModel.investment_emissionsDetails(
                    facilitiesdata,
                    year,
                    finalyeardata
                );

                categorydata20 = await kpiModel.upstream_vehicle_storage_emissions(
                    facilitiesdata,
                    year,
                    finalyeardata
                );
                categorydata21 = await kpiModel.downstream_vehicle_storage_emissions(
                    facilitiesdata,
                    year,
                    finalyeardata
                );

                array3 = [
                    ...categorydata7,
                    ...categorydata8,
                    ...hotelstayDetails,
                    ...othermodes_of_transportDetails,
                    ...categorydata9,
                    ...categorydata10,
                    ...categorydata11,
                    ...categorydata11,
                    ...categorydata12,
                    ...categorydata13,
                    ...categorydata14,
                    ...categorydata15,
                    ...categorydata16,
                    ...categorydata17,
                    ...categorydata18,
                    ...categorydata19,
                    ...categorydata20,
                    ...categorydata21,
                ];
                if (array3) {
                    await Promise.all(
                        array3.map(async (item) => {
                            let monthlyEmission = 0;

                            if (item.month_number && monthlyData2.hasOwnProperty(item.month_number)) {
                                if (item.category === "Employee Commuting" || item.category === "Home Office") {
                                    const dividedEmission = parseFloat(item.emission) / 12 || 0;
                                    monthlyData2[item.month_number] += dividedEmission;
                                    monthlyEmission = dividedEmission;
                                } else {
                                    const regularEmission = parseFloat(item.emission) || 0;
                                    monthlyData2[item.month_number] += regularEmission;
                                    monthlyEmission = regularEmission;
                                }

                                sum2 += monthlyEmission;
                            }
                        })
                    );

                    if (categorydata.length > 0) {
                        for (let item of categorydata) {
                            if (item.month_number && monthlyData2.hasOwnProperty(item.month_number)) {
                                const emissionFixed = parseFloat(item.scope3_emission || 0) || 0;
                                monthlyData2[item.month_number] += emissionFixed;
                                sum2 += emissionFixed;
                            }
                        }
                    }

                    scope3month.push(Object.keys(monthlyData2));
                    scope3.push(Object.values(monthlyData2).map((num) => num !== null ? parseFloat(num / 1000).toFixed(3) : null));
                }

                let series = [
                    { name: "Scope 1", data: scope1[0] },
                    { name: "Scope 2", data: scope2[0] },
                    { name: "Scope 3", data: scope3[0] },
                ];
                let sumtotal1 = sum ? parseFloat(sum / 1000).toFixed(3) : null;
                let sumtotal2 = sum1 ? parseFloat(sum1 / 1000).toFixed(3) : null;
                let sumtotal3 = sum2 ? parseFloat(sum2 / 1000).toFixed(3) : null;

                return res.json({
                    success: true,
                    message: "Succesfully fetched category",
                    scope1: sumtotal1,
                    scope2: sumtotal2,
                    scope3: sumtotal3,
                    series: series,
                    series_graph: [
                        parseFloat(sumtotal1),
                        parseFloat(sumtotal2),
                        parseFloat(sumtotal3),
                    ],
                    month: month,
                    status: 200,
                });
            }
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false });
    }
};

exports.kpiItemsList = async (req, res) => {
    try {
        const findKpiResponse = await kpiModel.findKpiItems();
        if (findKpiResponse.length > 0) {
            return res.status(200).json({ error: false, message: "KPI items retrieved successfully", success: true, data: findKpiResponse })
        } else {
            return res.status(200).json({ error: true, message: "No KPI items found", success: false })
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false })
    }
};

exports.kpiInventoryFuelConsumption = async (req, res) => {
    try {
        const { facilities, year, type_id } = req.body;
        const schema = Joi.object({
            facilities: Joi.string().allow("").required(),
            year: Joi.string().allow("").required(),
            type_id: Joi.string().allow("").required(),
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;

            let finalyear = "";
            let finalyeardata = "2";
            let where = ` where user_id = '${user_id}'`;
            const financialyear = await getSelectedColumn(
                "financial_year_setting",
                where,
                "*"
            );
            if (financialyear.length > 0) {
                let final_year = financialyear[0].financial_year;
                if (final_year == "2") {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "2";
                } else {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "1";
                }
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            }
            let month = finalyear;
            let monthlyData = {};
            let monthlyData1 = {};
            let monthlyData2 = {};
            month.forEach((month) => {
                monthlyData[month] = null;
                monthlyData1[month] = null;
                monthlyData2[month] = null;
            });

            const stationaryCombustionde = await kpiModel.stationaryCombustionde(facilities, year, type_id, finalyeardata);
            if (stationaryCombustionde) {
                let overallAnnualSum = 0;
                let overallAnnualSum1 = 0;
                let overallAnnualSum2 = 0;
                await Promise.all(
                    stationaryCombustionde.map(async (item) => {
                        if (
                            item.month_number &&
                            monthlyData.hasOwnProperty(item.month_number)
                        ) {
                            const emission = Number(item.emission);
                            const litreToGJ = Number(item.litre_to_GJ);
                            const gjToKWH = Number(item.GJ_To_KWH);
                            const converted = Number((emission * litreToGJ).toFixed(4)) || 0;
                            const converted2 = Number((emission * litreToGJ * gjToKWH).toFixed(4)) || 0;

                            monthlyData[item.month_number] += Number(emission.toFixed(4)) || 0;
                            monthlyData1[item.month_number] += converted;
                            monthlyData2[item.month_number] += converted2;
                            overallAnnualSum += Number(emission.toFixed(4)) || 0;
                            overallAnnualSum1 += converted;
                            overallAnnualSum2 += converted2;
                        }
                    })
                );
                monthlyData = { annual_total: overallAnnualSum, ...monthlyData };
                monthlyData1 = { annual_total: overallAnnualSum1, ...monthlyData1 };
                monthlyData2 = { annual_total: overallAnnualSum2, ...monthlyData2 };
            }

            return res.json({
                success: true,
                message: "Succesfully fetched kpi inventory fuel consumption",
                data: Object.values(monthlyData),
                statuinary_fuel: Object.values(monthlyData1),
                statuinary_fuel2: Object.values(monthlyData2),
                month: month,
                status: 200,
            });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "internal server error " + error.message, success: false })
    }
};

exports.getKpiInventoryStationaryCombustionde = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.object({
            facilities: Joi.string().allow("").required(),
            year: Joi.string().allow("").required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const getStationaryCombustiondeType = await kpiModel.getStationaryCombustiondeTypeByFacilty(facilities, year);

            return res.status(200).json({ error: false, message: "Successfully get stationary combustionde", success: true, data: getStationaryCombustiondeType });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false })
    }
};

exports.kpiInventoryEnergyUse = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.object({
            facilities: Joi.string().allow("").required(),
            year: Joi.string().allow("").required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;

            let finalyear = "";
            let finalyeardata = "2";
            let where = ` where user_id = '${user_id}'`;
            const financialyear = await getSelectedColumn(
                "financial_year_setting",
                where,
                "*"
            );
            if (financialyear.length > 0) {
                let final_year = financialyear[0].financial_year;
                if (final_year == "2") {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "2";
                } else {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "1";
                }
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            }
            let month = finalyear;
            let monthlyData = {};
            let monthlyData1 = {};
            let monthlyData2 = {};
            let monthlyData3 = {};
            month.forEach((month) => {
                monthlyData[month] = null;
                monthlyData1[month] = null;
                monthlyData2[month] = null;
                monthlyData3[month] = null;
            });
            const stationaryCombusiton = await kpiModel.fuelStationaryCombusiton(facilities, year, finalyeardata);
            if (stationaryCombusiton) {
                let overallAnnualSum = null;
                await Promise.all(
                    stationaryCombusiton.map(async (item) => {
                        if (
                            item.month_number &&
                            monthlyData3.hasOwnProperty(item.month_number)
                        ) {
                            monthlyData3[item.month_number] += Number(item.emission) || null;
                            overallAnnualSum += Number(item.emission) || null;
                        }
                    })
                );
                monthlyData3 = { annual_total: overallAnnualSum, ...monthlyData3 };
            }
            const heatandsteamde = await kpiModel.heatandsteamde(facilities, year, finalyeardata);
            if (heatandsteamde) {
                let overallAnnualSum = null;
                await Promise.all(
                    heatandsteamde.map(async (item) => {
                        if (
                            item.month_number &&
                            monthlyData.hasOwnProperty(item.month_number)
                        ) {
                            monthlyData[item.month_number] += Number(item.emission) || null;
                            overallAnnualSum += Number(item.emission) || null;
                        }
                    })
                );
                monthlyData = { annual_total: overallAnnualSum, ...monthlyData };
            }

            const electricity = await kpiModel.electricity(facilities, year, finalyeardata);
            if (electricity) {
                let overallAnnualSum = null;

                await Promise.all(
                    electricity.map(async (item) => {
                        const month = item.month_number;
                        const emission = item.emission !== null ? Number(item.emission) : null;

                        if (month && monthlyData1.hasOwnProperty(month)) {
                            if (emission !== null && !isNaN(emission)) {
                                monthlyData1[month] = emission;
                                overallAnnualSum = overallAnnualSum === null ? emission : overallAnnualSum + emission;
                            }
                        }
                    })
                );

                monthlyData1 = { annual_total: overallAnnualSum, ...monthlyData1 };
            }

            const renewableElectricity = await kpiModel.renewableElectricity(facilities, year, finalyeardata);
            if (renewableElectricity) {
                let overallAnnualSum1 = null;

                await Promise.all(
                    renewableElectricity.map(async (item) => {
                        const month = item.month_number;
                        const emission = item.emission !== null ? Number(item.emission) : null;

                        if (month && monthlyData2.hasOwnProperty(month)) {
                            if (emission !== null && !isNaN(emission)) {
                                monthlyData2[month] = emission;
                                overallAnnualSum1 = overallAnnualSum1 === null ? emission : overallAnnualSum1 + emission;
                            }
                        }
                    })
                );

                monthlyData2 = { annual_total: overallAnnualSum1, ...monthlyData2 };
            }

            return res.json({
                success: true,
                message: "Succesfully fetched kpi inventory fuel consumption",
                data: {
                    stationaryCombusiton: Object.values(monthlyData3),
                    heatingCooling: Object.values(monthlyData),
                    electricity: Object.values(monthlyData1),
                    renewableElectricity: Object.values(monthlyData2)
                },
                month: month,
                status: 200,
            });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false });
    }
};

exports.kpiInventoryPassengerVehicleEmission = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.object({
            facilities: Joi.string().allow("").required(),
            year: Joi.string().allow("").required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;

            let finalyear = "";
            let finalyeardata = "2";
            let where = ` where user_id = '${user_id}'`;
            const financialyear = await getSelectedColumn(
                "financial_year_setting",
                where,
                "*"
            );
            if (financialyear.length > 0) {
                let final_year = financialyear[0].financial_year;
                if (final_year == "2") {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "2";
                } else {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "1";
                }
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            }
            let month = finalyear;
            let monthlyData1 = {};
            let monthlyData2 = {};
            let monthlyData3 = {};

            month.forEach((month) => {
                monthlyData1[month] = null;
                monthlyData2[month] = null;
                monthlyData3[month] = null;
            });

            const kpiInventoryPassengerVehicleDieselResponse = await kpiModel.kpiInventoryPassengerVehicleDiesel(facilities, year, finalyeardata);
            if (kpiInventoryPassengerVehicleDieselResponse) {
                let overallAnnualSum = null;
                await Promise.all(
                    kpiInventoryPassengerVehicleDieselResponse.map(async (item) => {
                        if (item.month_number && monthlyData1.hasOwnProperty(item.month_number)
                        ) {
                            monthlyData1[item.month_number] += Number((item.emission / 1000).toFixed(4)) || null;
                            overallAnnualSum += Number((item.emission / 1000).toFixed(4)) || null;
                        }
                    })
                );
                let sortedData = Object.entries(monthlyData1);
                sortedData.unshift(["annual_total", overallAnnualSum ? Number(overallAnnualSum.toFixed(4)) : null]);
                monthlyData1 = Object.fromEntries(sortedData);
            }

            const kpiInventoryPassengerVehiclePetrolResponse = await kpiModel.kpiInventoryPassengerVehiclePetrol(facilities, year, finalyeardata)
            if (kpiInventoryPassengerVehiclePetrolResponse) {
                let overallAnnualSum = null;
                await Promise.all(
                    kpiInventoryPassengerVehiclePetrolResponse.map(async (item) => {
                        if (item.month_number && monthlyData2.hasOwnProperty(item.month_number)
                        ) {
                            monthlyData2[item.month_number] += Number((item.emission / 1000).toFixed(4)) || null;
                            overallAnnualSum += Number((item.emission / 1000).toFixed(4)) || null;
                        }
                    })
                );
                let sortedData = Object.entries(monthlyData2);
                sortedData.unshift(["annual_total", overallAnnualSum ? Number(overallAnnualSum.toFixed(4)) : null]);
                monthlyData2 = Object.fromEntries(sortedData);
            }

            const kpiInventoryPassengerVehicleResponse = await kpiModel.kpiInventoryPassengerVehicle(facilities, year, finalyeardata)
            if (kpiInventoryPassengerVehicleResponse) {
                let overallAnnualSum = null;
                await Promise.all(
                    kpiInventoryPassengerVehicleResponse.map(async (item) => {
                        if (item.month_number && monthlyData3.hasOwnProperty(item.month_number)
                        ) {
                            monthlyData3[item.month_number] += Number((item.emission / 1000).toFixed(4)) || null;
                            overallAnnualSum += Number((item.emission / 1000).toFixed(4)) || null;
                        }
                    })
                );
                let sortedData = Object.entries(monthlyData3);
                sortedData.unshift(["annual_total", overallAnnualSum ? Number(overallAnnualSum.toFixed(4)) : null]);
                monthlyData3 = Object.fromEntries(sortedData);
            }

            return res.json({
                success: true,
                message: "Succesfully fetched kpi inventory passenger vehicle",
                data: {
                    vehicle_diesel: Object.values(monthlyData1),
                    vehicle_petrol: Object.values(monthlyData2),
                    total_vehicle: Object.values(monthlyData3)
                },
                month: month,
                status: 200,
            });
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false })
    }
};

exports.kpiInventoryTransportVehicle = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.object({
            facilities: Joi.string().allow("").required(),
            year: Joi.string().allow("").required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;

            let finalyear = "";
            let finalyeardata = "2";
            let where = ` where user_id = '${user_id}'`;
            const financialyear = await getSelectedColumn(
                "financial_year_setting",
                where,
                "*"
            );
            if (financialyear.length > 0) {
                let final_year = financialyear[0].financial_year;
                if (final_year == "2") {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "2";
                } else {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "1";
                }
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            }
            let month = finalyear;
            let monthlyData1 = {};
            let monthlyData2 = {};
            month.forEach((month) => {
                monthlyData1[month] = null;
                monthlyData2[month] = null;
            });

            const transportVehicleEmission = await kpiModel.transportVehicleEmission(facilities, year, finalyeardata);
            if (transportVehicleEmission) {
                let overallAnnualSum = null;
                await Promise.all(
                    transportVehicleEmission.map(async (item) => {
                        if (item.month_number && monthlyData1.hasOwnProperty(item.month_number)
                        ) {
                            monthlyData1[item.month_number] += Number((item.emission / 1000).toFixed(4)) || null;
                            overallAnnualSum += Number((item.emission / 1000).toFixed(4)) || null;
                        }
                    })
                );
                let sortedData = Object.entries(monthlyData1);
                sortedData.unshift(["annual_total", overallAnnualSum]);
                monthlyData1 = Object.fromEntries(sortedData);
            }

            const freightTransportEmission = await kpiModel.freightTransportEmission(facilities, year, finalyeardata);
            if (freightTransportEmission) {
                let overallAnnualSum = null;
                await Promise.all(
                    freightTransportEmission.map(async (item) => {
                        if (item.month_number && monthlyData2.hasOwnProperty(item.month_number)
                        ) {
                            monthlyData2[item.month_number] += Number((item.emission).toFixed(4)) || null;
                            overallAnnualSum += Number((item.emission).toFixed(4)) || null;
                        }
                    })
                );
                let sortedData = Object.entries(monthlyData2);
                sortedData.unshift(["annual_total", overallAnnualSum]);
                monthlyData2 = Object.fromEntries(sortedData);
            }

            return res.json({
                success: true,
                message: "Succesfully fetched kpi transport vehicle",
                data: {
                    owend_transport: Object.values(monthlyData1),
                    freight_transport: Object.values(monthlyData2)
                },
                month: month,
                status: 200,
            });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false });
    }
};

exports.kpiInventoryBusinessTravel = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.object({
            facilities: Joi.string().allow("").required(),
            year: Joi.string().allow("").required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;

            let finalyear = "";
            let finalyeardata = "2";
            let where = ` where user_id = '${user_id}'`;
            const financialyear = await getSelectedColumn(
                "financial_year_setting",
                where,
                "*"
            );
            if (financialyear.length > 0) {
                let final_year = financialyear[0].financial_year;
                if (final_year == "2") {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "2";
                } else {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "1";
                }
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            }
            let month = finalyear;
            let monthlyData1 = {};
            let monthlyData2 = {};
            let monthlyData3 = {};
            month.forEach((month) => {
                monthlyData1[month] = null;
                monthlyData2[month] = null;
                monthlyData3[month] = null;
            });

            const flight_travelDetails = await kpiModel.flight_travelDetails(facilities, year, finalyeardata);
            const hotelstayDetails = await kpiModel.hotel_stayDetails(facilities, year, finalyeardata);
            const othermodes_of_transportDetails = await kpiModel.other_modes_of_transportDetails(facilities, year, finalyeardata);

            if (flight_travelDetails) {
                let overallAnnualSum = null;
                await Promise.all(
                    flight_travelDetails.map(async (item) => {
                        if (item.month_number && monthlyData1.hasOwnProperty(item.month_number)
                        ) {
                            monthlyData1[item.month_number] += Number((item.emission / 1000).toFixed(4)) || null;
                            overallAnnualSum += Number((item.emission / 1000).toFixed(4)) || null;
                        }
                    })
                );
                let sortedData = Object.entries(monthlyData1);
                sortedData.unshift(["annual_total", overallAnnualSum]);
                monthlyData1 = Object.fromEntries(sortedData);
            }

            if (hotelstayDetails) {
                let overallAnnualSum = null;
                await Promise.all(
                    hotelstayDetails.map(async (item) => {
                        if (item.month_number && monthlyData2.hasOwnProperty(item.month_number)
                        ) {
                            monthlyData2[item.month_number] += Number((item.emission / 1000).toFixed(4)) || null;
                            overallAnnualSum += Number((item.emission / 1000).toFixed(4)) || null;
                        }
                    })
                );
                let sortedData = Object.entries(monthlyData2);
                sortedData.unshift(["annual_total", overallAnnualSum]);
                monthlyData2 = Object.fromEntries(sortedData);
            }

            if (othermodes_of_transportDetails) {
                let overallAnnualSum = null;
                await Promise.all(
                    othermodes_of_transportDetails.map(async (item) => {
                        if (item.month_number && monthlyData3.hasOwnProperty(item.month_number)
                        ) {
                            monthlyData3[item.month_number] += Number((item.emission / 1000).toFixed(4)) || null;
                            overallAnnualSum += Number((item.emission / 1000).toFixed(4)) || null;
                        }
                    })
                );
                let sortedData = Object.entries(monthlyData3);
                sortedData.unshift(["annual_total", overallAnnualSum]);
                monthlyData3 = Object.fromEntries(sortedData);
            }

            return res.json({
                success: true,
                message: "Succesfully fetched kpi inventory business travel",
                data: {
                    flightTravelDetails: Object.values(monthlyData1),
                    hotelstayDetails: Object.values(monthlyData2),
                    othermodesOfTransportDetails: Object.values(monthlyData3)
                },
                month: month,
                status: 200,
            });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false })
    }
};

exports.kpiInventoryEmployeeCommute = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.object({
            facilities: Joi.string().allow("").required(),
            year: Joi.string().allow("").required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;

            let finalyear = "";
            let finalyeardata = "2";
            let where = ` where user_id = '${user_id}'`;
            const financialyear = await getSelectedColumn(
                "financial_year_setting",
                where,
                "*"
            );
            if (financialyear.length > 0) {
                let final_year = financialyear[0].financial_year;
                if (final_year == "2") {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "2";
                } else {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "1";
                }
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            }
            let month = finalyear;
            let monthlyData1 = {};
            let monthlyData2 = {};
            month.forEach((month) => {
                monthlyData1[month] = null;
                monthlyData2[month] = null;
            });

            const employeeCommutingEmission = await kpiModel.employeeCommutingEmission(facilities, year, finalyeardata);
            if (employeeCommutingEmission) {
                let overallAnnualSum = null;
                await Promise.all(
                    employeeCommutingEmission.map(async (item) => {
                        if (item.month_number && monthlyData1.hasOwnProperty(item.month_number)
                        ) {
                            monthlyData1[item.month_number] += Number((item.emission / 1000).toFixed(4)) || null;
                            overallAnnualSum += Number((item.emission / 1000).toFixed(4)) || null;
                        }
                    })
                );
                let sortedData = Object.entries(monthlyData1);
                sortedData.unshift(["annual_total", Number(overallAnnualSum.toFixed(4))]);
                monthlyData1 = Object.fromEntries(sortedData);
            }

            const employeeCommutingWorkingDays = await kpiModel.employeeCommutingWorkingDays(facilities, year, finalyeardata);
            if (employeeCommutingWorkingDays) {
                let overallAnnualSum = null;
                await Promise.all(
                    employeeCommutingWorkingDays.map(async (item) => {
                        if (item.month_number && monthlyData2.hasOwnProperty(item.month_number)
                        ) {
                            monthlyData2[item.month_number] += Number(item.working_days) || null;
                            overallAnnualSum += Number(item.working_days) || null

                        }
                    })
                );
                let sortedData = Object.entries(monthlyData2);
                sortedData.unshift(["annual_total", Number(overallAnnualSum.toFixed(4))]);
                monthlyData2 = Object.fromEntries(sortedData);
            }

            return res.json({
                success: true,
                message: "Succesfully fetched kpi inventory employee commute",
                data: {
                    employeeCommutingEmission: Object.values(monthlyData1),
                    employeeCommutingWorkingDays: Object.values(monthlyData2)
                },
                month: month,
                status: 200,
            });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false });
    }
};

exports.kpiInventoryWasteGenerated = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.object({
            facilities: Joi.string().allow("").required(),
            year: Joi.string().allow("").required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;

            let finalyear = "";
            let finalyeardata = "2";
            let where = ` where user_id = '${user_id}'`;
            const financialyear = await getSelectedColumn("financial_year_setting", where, "*");
            if (financialyear.length > 0) {
                let final_year = financialyear[0].financial_year;
                if (final_year == "2") {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "2";
                } else {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "1";
                }
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            }
            let month = finalyear;
            let monthlyWasteDiversion = {};
            let monthlyDiverteTreatment = {};
            let monthlyDivertedEmission = {};
            month.forEach((month) => {
                monthlyWasteDiversion[month] = null;
                monthlyDiverteTreatment[month] = null;
                monthlyDivertedEmission[month] = null;
            });

            const categorydata1 = await kpiModel.waste_generated_emissionsDetailsEmssion(facilities, year, finalyeardata);
            const categorydata2 = await kpiModel.waste_generated_emissionsDetailsEmssionByMethodemission(facilities, year, "reuse", finalyeardata);
            const categorydata3 = await kpiModel.waste_generated_emissionsDetailsEmssionByMethodemission(facilities, year, "composting", finalyeardata);
            const categorydata4 = await kpiModel.waste_generated_emissionsDetailsEmssionByMethodemission(facilities, year, "recycling", finalyeardata);
            let overallAnnualSum = null, overallAnnualSum1 = null, overallAnnualSum2 = null;
            if (categorydata1) {
                await Promise.all(
                    categorydata1.map(async (item) => {
                        if (item.month_number && monthlyWasteDiversion.hasOwnProperty(item.month_number)) {
                            monthlyWasteDiversion[item.month_number] += parseFloat(item.total_waste) || null;
                            overallAnnualSum += parseFloat(item.total_waste) || null;
                        }

                        if (item.month_number && monthlyDiverteTreatment.hasOwnProperty(item.month_number)) {
                            monthlyDiverteTreatment[item.month_number] += Number((item.emission / 1000).toFixed(4)) || null;
                            overallAnnualSum1 += Number((item.emission / 1000)) || null;
                        }
                    })
                );
                monthlyWasteDiversion = { annual_total: overallAnnualSum, ...monthlyWasteDiversion };
                monthlyDiverteTreatment = { annual_total: overallAnnualSum1 ? Number(overallAnnualSum1.toFixed(4)) : null, ...monthlyDiverteTreatment };
            }
            if (categorydata2) {
                await Promise.all(
                    categorydata2.map(async (item) => {
                        if (item.month_number && monthlyDivertedEmission.hasOwnProperty(item.month_number)) {
                            monthlyDivertedEmission[item.month_number] += parseFloat(item.total_waste) || null;
                            overallAnnualSum2 += Number((item.total_waste).toFixed(4)) || null;
                        }
                    })
                );
                monthlyDivertedEmission = { annual_total: overallAnnualSum2, ...monthlyDivertedEmission };
            }
            if (categorydata3) {
                await Promise.all(
                    categorydata3.map(async (item) => {
                        if (item.month_number && monthlyDivertedEmission.hasOwnProperty(item.month_number)) {
                            monthlyDivertedEmission[item.month_number] += parseFloat(item.total_waste) || null;
                            overallAnnualSum2 += Number((item.total_waste).toFixed(4)) || null;
                        }
                    })
                );
                monthlyDivertedEmission = { annual_total: overallAnnualSum2, ...monthlyDivertedEmission };
            }
            if (categorydata4) {
                await Promise.all(
                    categorydata4.map(async (item) => {
                        if (item.month_number && monthlyDivertedEmission.hasOwnProperty(item.month_number)) {
                            monthlyDivertedEmission[item.month_number] += parseFloat(item.total_waste) || null;
                            overallAnnualSum2 += Number((item.total_waste).toFixed(4)) || null;
                        }
                    })
                );
                monthlyDivertedEmission = { annual_total: overallAnnualSum2, ...monthlyDivertedEmission };
            }

            return res.json({
                success: true,
                message: "Succesfully fetched waste generated",
                waste_disposed: Object.values(monthlyWasteDiversion),
                waste_emissions: Object.values(monthlyDiverteTreatment),
                diverted_emssion: Object.values(monthlyDivertedEmission),
                month: month,
                status: 200,
            });
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json({ error: true, message: "internal server error " + error.message, success: false });
    }
};

exports.kpiInventoryWaterUsage = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.object({
            facilities: Joi.string().allow("").required(),
            year: Joi.string().allow("").required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;

            let finalyear = "";
            let finalyeardata = "2";
            let where = ` where user_id = '${user_id}'`;
            const financialyear = await getSelectedColumn("financial_year_setting", where, "*");
            if (financialyear.length > 0) {
                let final_year = financialyear[0].financial_year;
                if (final_year == "2") {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "2";
                } else {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "1";
                }
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            }
            let month = finalyear;

            let waterDischargeByMonth = {};
            let waterUsageByMonth = {};
            let waterTreatmentByMonth = {};
            let waterEmissionByMonth = {};
            let overallAnnualSum = null, overallAnnualSum1 = null, overallAnnualSum2 = null, overallAnnualSum3 = null;

            month.forEach((month) => {
                waterDischargeByMonth[month] = null;
                waterUsageByMonth[month] = null;
                waterTreatmentByMonth[month] = null;
                waterEmissionByMonth[month] = null;
            });

            const [waterDischarge, waterWithdrawal, waterTreatment, waterEmission, waterSupplyTreatment] = await Promise.all([
                kpiModel.water_discharge_by_destination(facilities, year, finalyeardata),
                kpiModel.water_withdrawl_by_source(facilities, year, finalyeardata),
                kpiModel.water_supply_treatment_category(facilities, year, finalyeardata),
                kpiModel.water_supply_treatment_categoryDetails(facilities, year, finalyeardata),
                kpiModel.water_supply_treatment_categoryDetailsemission(facilities, year)
            ]);

            waterDischarge?.forEach((item) => {
                if (item.month_number && waterDischargeByMonth.hasOwnProperty(item.month_number)) {
                    waterDischargeByMonth[item.month_number] += parseFloat(item.water_discharge) || null;
                    overallAnnualSum += parseFloat(item.water_discharge) || null;
                }
            });
            waterDischargeByMonth = { annual_total: overallAnnualSum ? Number(overallAnnualSum.toFixed(4)) : overallAnnualSum, ...waterDischargeByMonth };

            waterTreatment?.forEach((item) => {
                if (item.month_number && waterTreatmentByMonth.hasOwnProperty(item.month_number)) {
                    waterTreatmentByMonth[item.month_number] += parseFloat(item.water_treatment) || null;
                    overallAnnualSum2 += parseFloat(item.water_treatment) || null;
                }
            });
            waterTreatmentByMonth = { annual_total: overallAnnualSum2 ? Number(overallAnnualSum2.toFixed(4)) : overallAnnualSum2, ...waterTreatmentByMonth };

            waterEmission?.forEach((item) => {
                if (item.month_number && waterEmissionByMonth.hasOwnProperty(item.month_number)) {
                    waterEmissionByMonth[item.month_number] += Number((item.emission / 1000).toFixed(4)) || null;
                    overallAnnualSum3 += Number((item.emission / 1000).toFixed(4)) || null;
                }
            });
            waterEmissionByMonth = { annual_total: overallAnnualSum3 ? Number(overallAnnualSum3.toFixed(4)) : overallAnnualSum3, ...waterEmissionByMonth };

            for (const item of waterSupplyTreatment) {
                let where1 = `WHERE G.water_supply_treatment_id = '${item.id}' AND G.water_withdrawl != ''`;

                if (finalyeardata == '2') {
                    where1 += ` AND G.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") AND G.month != '' GROUP BY G.water_withdrawl`;
                } else {
                    where1 += ` AND G.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") AND G.month != '' GROUP BY G.water_withdrawl`;
                }

                const water_withdrawl = await getSelectedColumn(
                    "water_withdrawl_by_source G",
                    where1,
                    "G.totalwaterwithdrawl, G.water_withdrawl, G.month AS month_number"
                );

                water_withdrawl?.forEach((item) => {
                    if (item.month_number && waterUsageByMonth.hasOwnProperty(item.month_number)) {
                        waterUsageByMonth[item.month_number] += parseFloat(item.totalwaterwithdrawl) || null;
                        overallAnnualSum1 += parseFloat(item.totalwaterwithdrawl) || null;
                    }
                });
                waterUsageByMonth = { annual_total: overallAnnualSum1 ? Number(overallAnnualSum1.toFixed(4)) : overallAnnualSum1, ...waterUsageByMonth };

                Object.keys(waterUsageByMonth).forEach((month) => {
                    if (waterTreatmentByMonth[month]) {
                        waterUsageByMonth[month] -= waterTreatmentByMonth[month];
                    }
                });
            }

            return res.json({
                success: true,
                message: "Succesfully fetched kpi inventory water",
                data: {
                    waterTreatment: Object.values(waterDischargeByMonth),
                    waterWithdrawal: Object.values(waterUsageByMonth),
                    waterDischarge: Object.values(waterTreatmentByMonth),
                    waterEmission: Object.values(waterEmissionByMonth)
                },
                month: month,
                status: 200,
            });
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false });
    }
};

exports.kpiInventoryGeneralData = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.object({
            facilities: Joi.string().allow("").required(),
            year: Joi.string().allow("").required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;

            let finalyear = "";
            let finalyeardata = "2";
            let where = ` where user_id = '${user_id}'`;
            const financialyear = await getSelectedColumn("financial_year_setting", where, "*");
            if (financialyear.length > 0) {
                let final_year = financialyear[0].financial_year;
                if (final_year == "2") {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "2";
                } else {
                    finalyear = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    finalyeardata = "1";
                }
            } else {
                finalyear = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];
                finalyeardata = "2";
            }
            let month = finalyear;

            let emissionPurchasedGoodsValueQuantityByMonth = {};
            let emissionPurchasedGoodsByMonth = {};
            let noOfEmployeeByMonth = {};
            let noOfDieselVehiclesByMonth = {};
            let noOfPetrolVehiclesByMonth = {};
            let totalVehiclesByMonth = {};
            let totalAreaByMonth = {};
            let energyRefAreaByMonth = {};

            let overallAnnualSum = null, overallAnnualSum1 = null, overallAnnualSum2 = null, overallAnnualSum3 = null, overallAnnualSum4 = null, overallAnnualSum5 = null, overallAnnualSum6 = null, overallAnnualSum7 = null;

            month.forEach((month) => {
                emissionPurchasedGoodsValueQuantityByMonth[month] = null;
                emissionPurchasedGoodsByMonth[month] = null;
                noOfEmployeeByMonth[month] = null;
                noOfDieselVehiclesByMonth[month] = null;
                noOfPetrolVehiclesByMonth[month] = null;
                totalVehiclesByMonth[month] = null;
                totalAreaByMonth[month] = null;
                energyRefAreaByMonth[month] = null;
            });

            const [purchaseGoodsAndServicesValueQuantity, purchaseGoodsAndServices, noOfEmployee, noOfDieselVehicles, noOfPetrolVehicles, totalVehicles, total_area_energy_area] = await Promise.all([
                kpiModel.purchase_goods_and_services_value_quantity(facilities, year, finalyeardata),
                kpiModel.purchase_goods_and_services(facilities, year, finalyeardata),
                kpiModel.no_of_employee(facilities, year, finalyeardata),
                kpiModel.no_of_diesel_vehicles(facilities, year, finalyeardata),
                kpiModel.no_of_petrol_vehicles(facilities, year, finalyeardata),
                kpiModel.total_vehicles(facilities, year, finalyeardata),
                kpiModel.total_area_energy_area(facilities)
            ]);

            purchaseGoodsAndServicesValueQuantity?.forEach((item) => {
                if (item.month_number && emissionPurchasedGoodsValueQuantityByMonth.hasOwnProperty(item.month_number)) {
                    emissionPurchasedGoodsValueQuantityByMonth[item.month_number] += item.valuequantity || null;
                    overallAnnualSum7 += item.valuequantity || null;
                }
            });
            emissionPurchasedGoodsValueQuantityByMonth = { annual_total: overallAnnualSum7, ...emissionPurchasedGoodsValueQuantityByMonth };

            purchaseGoodsAndServices?.forEach((item) => {
                if (item.month_number && emissionPurchasedGoodsByMonth.hasOwnProperty(item.month_number)) {
                    emissionPurchasedGoodsByMonth[item.month_number] += Number(parseFloat(item.emission / 1000).toFixed(4)) || null;
                    overallAnnualSum6 += Number(parseFloat(item.emission / 1000).toFixed(4)) || null;
                }
            });
            emissionPurchasedGoodsByMonth = { annual_total: overallAnnualSum6, ...emissionPurchasedGoodsByMonth };

            noOfEmployee?.forEach((item) => {
                const employee = item.no_of_employees ? Number(item.no_of_employees) : null;
                month.forEach((m) => {
                    if (employee == null) {
                        noOfEmployeeByMonth[m] = employee
                    } else {
                        noOfEmployeeByMonth[m] += employee ? Number(parseFloat(item.no_of_employees).toFixed(4)) : null;
                    }
                });
                overallAnnualSum += employee ?? null;
                if (overallAnnualSum == 0) {
                    overallAnnualSum = null
                }
            });
            noOfEmployeeByMonth = { annual_total: overallAnnualSum, ...noOfEmployeeByMonth };

            noOfDieselVehicles?.forEach((item) => {
                if (item.month_number && noOfDieselVehiclesByMonth.hasOwnProperty(item.month_number)) {
                    noOfDieselVehiclesByMonth[item.month_number] += parseFloat(item.no_of_vehicle) || null;
                    overallAnnualSum1 += Math.round(item.no_of_vehicle / noOfDieselVehicles.length) || null;
                }
            });
            noOfDieselVehiclesByMonth = { annual_total: overallAnnualSum1, ...noOfDieselVehiclesByMonth };

            noOfPetrolVehicles?.forEach((item) => {
                if (item.month_number && noOfPetrolVehiclesByMonth.hasOwnProperty(item.month_number)) {
                    noOfPetrolVehiclesByMonth[item.month_number] += parseFloat(item.no_of_vehicle) || null;
                    overallAnnualSum2 += Math.round(item.no_of_vehicle / noOfPetrolVehicles.length) || null;
                }
            });
            noOfPetrolVehiclesByMonth = { annual_total: overallAnnualSum2, ...noOfPetrolVehiclesByMonth };

            totalVehicles?.forEach((item) => {
                if (item.month_number && totalVehiclesByMonth.hasOwnProperty(item.month_number)) {
                    totalVehiclesByMonth[item.month_number] += parseFloat(item.no_of_vehicle) || null;
                    overallAnnualSum3 += Math.round(item.no_of_vehicle / totalVehicles.length) || null;
                }
            });
            totalVehiclesByMonth = { annual_total: overallAnnualSum3, ...totalVehiclesByMonth };

            total_area_energy_area?.forEach((item) => {
                const totalArea = item.total_area ? parseFloat(item.total_area) : null;
                month.forEach((m) => {
                    if (totalArea === null || totalArea === 0) {
                        totalAreaByMonth[m] = null;
                    } else {
                        totalAreaByMonth[m] += Number((totalArea).toFixed(4));
                    }
                });
                overallAnnualSum4 += totalArea !== null ? totalArea : 0;
                if (overallAnnualSum4 == 0) {
                    overallAnnualSum4 = null
                }
            });
            totalAreaByMonth = { annual_total: overallAnnualSum4, ...totalAreaByMonth };

            total_area_energy_area?.forEach((item) => {
                const energyArea = item.energy_ref_area ? parseFloat(item.energy_ref_area) : null;
                month.forEach((m) => {
                    if (energyArea == null) {
                        energyRefAreaByMonth[m] = energyArea
                    } else {
                        energyRefAreaByMonth[m] += energyArea ? Number(parseFloat(energyArea).toFixed(4)) : null;
                    }
                });
                overallAnnualSum5 += energyArea ?? null;
                if (overallAnnualSum5 == 0) {
                    overallAnnualSum5 = null
                }
            });
            energyRefAreaByMonth = { annual_total: overallAnnualSum5, ...energyRefAreaByMonth };

            return res.json({
                success: true,
                message: "Succesfully fetched kpi inventory general data",
                data: {
                    purchaseGoodsAndServicesValueQuantity: Object.values(emissionPurchasedGoodsValueQuantityByMonth),
                    purchaseGoodsAndServices: Object.values(emissionPurchasedGoodsByMonth),
                    noOfEmployee: Object.values(noOfEmployeeByMonth),
                    noOfDieselVehicles: Object.values(noOfDieselVehiclesByMonth),
                    noOfPetrolVehicles: Object.values(noOfPetrolVehiclesByMonth),
                    totalVehicles: Object.values(totalVehiclesByMonth),
                    total_area: Object.values(totalAreaByMonth),
                    energy_ref_area: Object.values(energyRefAreaByMonth)
                },
                month: month,
                status: 200,
            });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false });
    }
};

exports.addKpiTarget = async (req, res) => {
    try {
        const { jsonData } = req.body;
        const schema = Joi.object({
            jsonData: Joi.string().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;
            const getKpiTargetResponse = await kpiModel.getKpiTargetByUserId(user_id);
            if (getKpiTargetResponse.length > 0) {
                await kpiModel.deleteKpiTargetByUserId(user_id)
            }

            const jsonDataParse = JSON.parse(jsonData);
            jsonDataParse.forEach(async val => {
                await kpiModel.insertKpiTraget({
                    user_id: user_id,
                    kpi_id: val.kpi_id,
                    target: val.target,
                    unit: val.unit,
                    target_type: val.target_type,
                    annual: val.target_type == 'Annually' ? val.target : val.target_type == 'Quaterly' ? (val.target) * 4 : (val.target) * 12,
                    quaterly: val.target_type == 'Annually' ? Number(((val.target) / 3).toFixed(2)) : val.target_type == 'Quaterly' ? val.target : (val.target) * 3,
                    monthly: val.target_type == 'Annually' ? Number(((val.target) / 12).toFixed(2)) : val.target_type == 'Quaterly' ? Number(((val.target) / 3).toFixed(3)) : val.target
                });
            })

            return res.status(201).json({ error: false, success: true, message: "Successfully add kpi target" })
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false })
    }
};

exports.getKpiTargetByUserId = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const getKpiTargetResponse = await kpiModel.getKpiTargetByUserId(user_id);

        return res.status(200).json({
            error: getKpiTargetResponse.length > 0 ? false : true,
            message: getKpiTargetResponse.length > 0 ? "Successfully retrieved KPI inventory" : "No KPI inventory found",
            success: getKpiTargetResponse.length > 0 ? true : false,
            updated_at: getKpiTargetResponse.length > 0 ? getKpiTargetResponse[0].updated_at : '',
            data: getKpiTargetResponse.length > 0 ? getKpiTargetResponse : []
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal servere erorr " + error.message, success: false });
    }
};

exports.addKpiInventory = async (req, res) => {
    try {
        const { facility_id, year, jsonData } = req.body;
        const schema = Joi.object({
            facility_id: Joi.string().required(),
            year: Joi.string().required(),
            jsonData: Joi.alternatives().try(Joi.string(), Joi.object()).required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;
            let kpiData = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
            let kpiJson = typeof jsonData === "string" ? jsonData : JSON.stringify(jsonData);

            const existingKpiInventory = await kpiModel.getKpiInventoryByFacilitityAndYear(facility_id, year);
            const existingKpiInventoryJson = await kpiModel.getKpiInventoryJsonByFacilitityAndYear(facility_id, year);

            if (existingKpiInventoryJson && existingKpiInventoryJson.length > 0) {
                await kpiModel.updateKpiInventoryJson(kpiJson, existingKpiInventoryJson[0].id);
            } else {
                const data = {
                    facility_id,
                    year,
                    user_id,
                    inventory_json: kpiJson
                }
                await kpiModel.insertKpiInventoryJson(data);
            }

            if (existingKpiInventory && existingKpiInventory.length > 0) await kpiModel.deleteKpiInventory(facility_id, year);

            const findKpiResponse = await kpiModel.findKpiItems();
            for (const val of findKpiResponse) {
                let kpi_value;
                switch (val.id) {
                    case 1:
                        kpi_value = kpiData["Scope 1"];
                        break;
                    case 2:
                        kpi_value = kpiData["Scope 2"];
                        break;
                    case 3:
                        kpi_value = kpiData["Scope 3"];
                        break;
                    case 4:
                        kpi_value = kpiData["Total Emissions"];
                        break;
                    case 5:
                        kpi_value = {
                            annual:
                                kpiData["Total Output"]?.annual && kpiData["Total Output"].annual !== 0
                                    ? Number(parseFloat(kpiData["Total Emissions"]?.annual / kpiData["Total Output"]?.annual).toFixed(4))
                                    : null,
                            monthly: kpiData["Total Emissions"]?.monthly?.map((val, index) =>
                                kpiData["Total Output"]?.monthly?.[index] && kpiData["Total Output"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Total Output"].monthly[index]).toFixed(4))
                                    : null
                            )
                        };
                        break;
                    case 6:
                        kpi_value = {
                            annual:
                                kpiData["Total Revenue (in Mn)"]?.annual && kpiData["Total Revenue (in Mn)"].annual !== 0
                                    ? Number(parseFloat(kpiData["Total Emissions"]?.annual / kpiData["Total Revenue (in Mn)"].annual).toFixed(4))
                                    : null,
                            monthly: kpiData["Total Emissions"]?.monthly?.map((val, index) =>
                                kpiData["Total Revenue (in Mn)"]?.monthly?.[index] && kpiData["Total Revenue (in Mn)"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Total Revenue (in Mn)"].monthly[index]).toFixed(4))
                                    : null
                            )
                        };
                        break;
                    case 7:
                        kpi_value = {
                            annual:
                                kpiData["No. of Employees"]?.annual && kpiData["No. of Employees"].annual !== 0
                                    ? Number(parseFloat(kpiData["Total Emissions"]?.annual / kpiData["No. of Employees"].annual).toFixed(4))
                                    : null,
                            monthly: kpiData["Total Emissions"]?.monthly?.map((val, index) =>
                                kpiData["No. of Employees"]?.monthly?.[index] && kpiData["No. of Employees"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["No. of Employees"].monthly[index]).toFixed(4))
                                    : null
                            )
                        };
                        break;
                    case 8:
                        kpi_value = {
                            annual:
                                kpiData["Total Area"]?.annual && kpiData["Total Area"].annual !== 0
                                    ? Number(parseFloat(kpiData["Total Emissions"]?.annual / kpiData["Total Area"].annual).toFixed(4))
                                    : null,
                            monthly: kpiData["Total Emissions"]?.monthly?.map((val, index) =>
                                kpiData["Total Area"]?.monthly?.[index] && kpiData["Total Area"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Total Area"].monthly[index]).toFixed(4))
                                    : null
                            )
                        };
                        break;
                    case 9:
                        kpi_value = {
                            annual:
                                kpiData["Energy Ref Area"]?.annual && kpiData["Energy Ref Area"].annual !== 0
                                    ? Number(parseFloat(kpiData["Total Emissions"]?.annual / kpiData["Energy Ref Area"].annual).toFixed(4))
                                    : null,
                            monthly: kpiData["Total Emissions"]?.monthly?.map((val, index) =>
                                kpiData["Energy Ref Area"]?.monthly?.[index] && kpiData["Energy Ref Area"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Energy Ref Area"].monthly[index]).toFixed(4))
                                    : null
                            )
                        };
                        break;
                    case 10:
                        kpi_value = {
                            annual:
                                kpiData["Total Energy Consumed"]?.annual && kpiData["Total Energy Consumed"].annual !== 0
                                    ? Number(parseFloat(kpiData["Total Emissions"]?.annual / kpiData["Total Energy Consumed"].annual).toFixed(4))
                                    : null,
                            monthly: kpiData["Total Emissions"]?.monthly?.map((val, index) =>
                                kpiData["Total Energy Consumed"]?.monthly?.[index] && kpiData["Total Energy Consumed"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Total Energy Consumed"].monthly[index]).toFixed(4))
                                    : null
                            )
                        };
                        break;
                    case 11:
                        kpi_value = {
                            annual:
                                kpiData["No. of vehicles (Petrol)"]?.annual && kpiData["No. of vehicles (Petrol)"].annual !== 0
                                    ? Number(parseFloat(kpiData["Owned Passenger Vehicle Emiss. - Petrol"]?.annual / kpiData["No. of vehicles (Petrol)"].annual).toFixed(4))
                                    : null,
                            monthly: kpiData["Owned Passenger Vehicle Emiss. - Petrol"]?.monthly?.map((val, index) =>
                                kpiData["No. of vehicles (Petrol)"]?.monthly?.[index] && kpiData["No. of vehicles (Petrol)"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["No. of vehicles (Petrol)"].monthly[index]).toFixed(4))
                                    : null
                            )
                        };
                        break;
                    case 12:
                        kpi_value = {
                            annual:
                                kpiData["No. of vehicles (Diesel)"]?.annual && kpiData["No. of vehicles (Diesel)"].annual !== 0
                                    ? Number(parseFloat(kpiData["Owned Passenger Vehicle Emiss. - Diesel"]?.annual / kpiData["No. of vehicles (Diesel)"].annual).toFixed(4))
                                    : null,
                            monthly: kpiData["Owned Passenger Vehicle Emiss. - Diesel"]?.monthly?.map((val, index) =>
                                kpiData["No. of vehicles (Diesel)"]?.monthly?.[index] && kpiData["No. of vehicles (Diesel)"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["No. of vehicles (Diesel)"].monthly[index]).toFixed(4))
                                    : null
                            )
                        };
                        break;
                    case 13:
                        kpi_value = kpiData["Total Owned Passenger Vehicle Emiss."];
                        break;
                    case 14:
                        kpi_value = {
                            annual:
                                kpiData["Total vehicles"]?.annual && kpiData["Total vehicles"].annual !== 0
                                    ? Number(parseFloat(kpiData["Total Owned Passenger Vehicle Emiss."]?.annual / kpiData["Total vehicles"].annual).toFixed(4))
                                    : null,
                            monthly: kpiData["Total Owned Passenger Vehicle Emiss."]?.monthly?.map((val, index) =>
                                kpiData["Total vehicles"]?.monthly?.[index] && kpiData["Total vehicles"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Total vehicles"].monthly[index]).toFixed(4))
                                    : null
                            )
                        };
                        break;
                    case 15:
                        kpi_value = kpiData["Owned Transport Vehicle Emiss."];
                        break;
                    case 16:
                        kpi_value = {
                            annual:
                                kpiData["Owned Freight Vehicle Emiss."]?.annual && kpiData["Owned Freight Vehicle Emiss."].annual !== 0
                                    ? Number(parseFloat(kpiData["Owned Transport Vehicle Emiss."]?.annual / kpiData["Owned Freight Vehicle Emiss."].annual).toFixed(4))
                                    : null,
                            monthly: kpiData["Owned Transport Vehicle Emiss."]?.monthly?.map((val, index) =>
                                kpiData["Owned Freight Vehicle Emiss."]?.monthly?.[index] && kpiData["Owned Freight Vehicle Emiss."].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Owned Freight Vehicle Emiss."].monthly[index]).toFixed(4))
                                    : null
                            )
                        };
                        break;
                    case 17:
                        kpi_value = {
                            annual: kpiData["Emissions in Flight travel"]?.annual + kpiData["Emissions in Other mode of travel"]?.annual + kpiData["Emissions in Hotel stay"]?.annual,
                            monthly: kpiData["Emissions in Flight travel"]?.monthly?.map((val, index) =>
                                kpiData["Emissions in Flight travel"]?.monthly?.[index] + kpiData["Emissions in Other mode of travel"]?.monthly?.[index] + kpiData["Emissions in Hotel stay"]?.monthly?.[index]
                            )
                        };
                        break;
                    case 18:
                        kpi_value = kpiData["Emissions in Flight travel"];
                        break;
                    case 19:
                        const annualNumerator =
                            (kpiData["Emissions in Flight travel"]?.annual || 0) +
                            (kpiData["Emissions in Other mode of travel"]?.annual || 0) +
                            (kpiData["Emissions in Hotel stay"]?.annual || 0);

                        const annualDenominator = kpiData["No. of Employees"]?.annual || 0;

                        kpi_value = {
                            annual: annualDenominator !== 0 ? Number(parseFloat(annualNumerator / annualDenominator).toFixed(4)) : null,
                            monthly: kpiData["Emissions in Flight travel"]?.monthly?.map((_, index) => {
                                const numerator =
                                    (kpiData["Emissions in Flight travel"]?.monthly?.[index] || 0) +
                                    (kpiData["Emissions in Other mode of travel"]?.monthly?.[index] || 0) + (kpiData["Emissions in Hotel stay"]?.monthly?.[index] || 0);
                                const denominator = kpiData["No. of Employees"]?.monthly?.[index] || 0;

                                return denominator !== 0 ? Number(parseFloat(numerator / denominator).toFixed(4)) : null;
                            })
                        };
                        break;
                    case 20:
                        kpi_value = {
                            annual: kpiData['No. of Employees']?.annual && kpiData['No. of Employees']?.annual !== 0 ? Number(parseFloat(kpiData['Emissions in Employee commute']?.annual / kpiData['No. of Employees']?.annual).toFixed(4)) : null,
                            monthly: kpiData["Emissions in Employee commute"]?.monthly?.map((val, index) =>
                                kpiData["No. of Employees"]?.monthly?.[index] && kpiData["No. of Employees"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["No. of Employees"].monthly[index]).toFixed(4))
                                    : null
                            )
                        }
                        break;
                    case 21:
                        kpi_value = kpiData["Total Energy Consumed"];
                        break;
                    case 22:
                        kpi_value = {
                            annual: kpiData['Total Energy Consumed']?.annual && kpiData['Total Energy Consumed']?.annual !== 0 ? Number(parseFloat(kpiData['Renewable Electricity']?.annual / kpiData['Total Energy Consumed']?.annual).toFixed(4)) : null,
                            monthly: kpiData["Renewable Electricity"]?.monthly?.map((val, index) =>
                                kpiData["Total Energy Consumed"]?.monthly?.[index] && kpiData["Total Energy Consumed"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Total Energy Consumed"].monthly[index]).toFixed(4))
                                    : null
                            )
                        }
                        break;
                    case 23:
                        kpi_value = {
                            annual: kpiData['Electricity']?.annual && kpiData['Electricity']?.annual !== 0 ? Number(parseFloat(kpiData['Renewable Electricity']?.annual / kpiData['Electricity']?.annual).toFixed(4)) : null,
                            monthly: kpiData["Renewable Electricity"]?.monthly?.map((val, index) =>
                                kpiData["Electricity"]?.monthly?.[index] && kpiData["Electricity"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Electricity"].monthly[index]).toFixed(4))
                                    : null
                            )
                        }
                        break;

                    case 24:
                        kpi_value = kpiData["Total Fuel Consumption"];
                        break;
                    case 25:
                        kpi_value = {
                            annual: kpiData['Total Output']?.annual && kpiData['Total Output']?.annual !== 0 ? Number(parseFloat(kpiData['Total Fuel Consumption']?.annual / kpiData['Total Output']?.annual).toFixed(4)) : null,
                            monthly: kpiData["Total Fuel Consumption"]?.monthly?.map((val, index) =>
                                kpiData["Total Output"]?.monthly?.[index] && kpiData["Total Output"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Total Output"].monthly[index]).toFixed(4))
                                    : null
                            )
                        }
                        break;
                    case 26:
                        kpi_value = {
                            annual: kpiData['Total Revenue (in Mn)']?.annual && kpiData['Total Revenue (in Mn)']?.annual !== 0 ? Number(parseFloat(kpiData['Total Fuel Consumption']?.annual / kpiData['Total Revenue (in Mn)']?.annual).toFixed(4)) : null,
                            monthly: kpiData["Total Fuel Consumption"]?.monthly?.map((val, index) =>
                                kpiData["Total Revenue (in Mn)"]?.monthly?.[index] && kpiData["Total Revenue (in Mn)"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Total Revenue (in Mn)"].monthly[index]).toFixed(4))
                                    : null
                            )
                        }
                        break;
                    case 27:
                        kpi_value = kpiData["Emissions in waste treatment"];
                        break;
                    case 28:
                        kpi_value = {
                            annual: kpiData['Total Output']?.annual && kpiData['Total Output']?.annual !== 0 ? Number(parseFloat(kpiData['Waste Generated']?.annual / kpiData['Total Output']?.annual).toFixed(4)) : null,
                            monthly: kpiData["Waste Generated"]?.monthly?.map((val, index) =>
                                kpiData["Total Output"]?.monthly?.[index] && kpiData["Total Output"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Total Output"].monthly[index]).toFixed(4))
                                    : null
                            )
                        }
                        break;
                    case 29:
                        kpi_value = {
                            annual: kpiData['Waste Generated']?.annual && kpiData['Waste Generated']?.annual !== 0 ? Number(parseFloat(kpiData['Waste Diverted']?.annual / kpiData['Waste Generated']?.annual).toFixed(4)) : null,
                            monthly: kpiData["Waste Diverted"]?.monthly?.map((val, index) =>
                                kpiData["Waste Generated"]?.monthly?.[index] && kpiData["Waste Generated"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Waste Generated"].monthly[index]).toFixed(4))
                                    : null
                            )
                        }
                        break;
                    case 30:
                        kpi_value = kpiData["Water Usage"];
                        break;
                    case 31:
                        kpi_value = {
                            annual: kpiData['Water Discharged']?.annual && kpiData['Water Discharged']?.annual !== 0 ? Number(parseFloat(kpiData['Water Treated']?.annual / kpiData['Water Discharged']?.annual).toFixed(4)) : null,
                            monthly: kpiData["Water Treated"]?.monthly?.map((val, index) =>
                                kpiData["Water Discharged"]?.monthly?.[index] && kpiData["Water Discharged"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Water Discharged"].monthly[index]).toFixed(4))
                                    : null
                            )
                        }
                        break;
                    case 32:
                        kpi_value = {
                            annual: kpiData['No. of Employees']?.annual && kpiData['No. of Employees']?.annual !== 0 ? Number(parseFloat(kpiData['Water Usage']?.annual / kpiData['No. of Employees']?.annual).toFixed(4)) : null,
                            monthly: kpiData["Water Usage"]?.monthly?.map((val, index) =>
                                kpiData["No. of Employees"]?.monthly?.[index] && kpiData["No. of Employees"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["No. of Employees"].monthly[index]).toFixed(4))
                                    : null
                            )
                        }
                        break;
                    case 33:
                        kpi_value = {
                            annual: kpiData['Total Output']?.annual && kpiData['Total Output']?.annual !== 0 ? Number(parseFloat(kpiData['Water Usage']?.annual / kpiData['Total Output']?.annual).toFixed(4)) : null,
                            monthly: kpiData["Water Usage"]?.monthly?.map((val, index) =>
                                kpiData["Total Output"]?.monthly?.[index] && kpiData["Total Output"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Total Output"].monthly[index]).toFixed(4))
                                    : null
                            )
                        }
                        break;
                    case 34:
                        kpi_value = kpiData["Emissions in water treatment"];
                        break;
                    case 35:
                        kpi_value = kpiData["Total Emission Purchase Goods & Services"];
                        break;
                    case 36:
                        kpi_value = {
                            annual: kpiData['Total Emission Purchase Items Per Amount']?.annual && kpiData['Total Emission Purchase Items Per Amount']?.annual !== 0 ? Number(parseFloat(kpiData['Total Emission Purchase Goods & Services']?.annual / kpiData['Total Emission Purchase Items Per Amount']?.annual).toFixed(4)) : null,
                            monthly: kpiData["Total Emission Purchase Goods & Services"]?.monthly?.map((val, index) =>
                                kpiData["Total Emission Purchase Items Per Amount"]?.monthly?.[index] && kpiData["Total Emission Purchase Items Per Amount"].monthly[index] !== 0
                                    ? Number(parseFloat(val / kpiData["Total Emission Purchase Items Per Amount"].monthly[index]).toFixed(4))
                                    : null
                            )
                        }
                        break;
                    default:
                        kpi_value = {
                            annual: null,
                            monthly: [null, null, null, null, null, null, null, null, null, null, null, null]
                        };
                        break;
                }

                const data = {
                    facility_id,
                    year,
                    kpi_item_id: val.id,
                    annual: kpi_value.annual,
                    jan: kpi_value.monthly[0],
                    feb: kpi_value.monthly[1],
                    mar: kpi_value.monthly[2],
                    apr: kpi_value.monthly[3],
                    may: kpi_value.monthly[4],
                    jun: kpi_value.monthly[5],
                    jul: kpi_value.monthly[6],
                    aug: kpi_value.monthly[7],
                    sep: kpi_value.monthly[8],
                    oct: kpi_value.monthly[9],
                    nov: kpi_value.monthly[10],
                    dec: kpi_value.monthly[11],
                    user_id
                };
                await kpiModel.insertKpiInventory(data);
            }

            return res.status(existingKpiInventory.length > 0 ? 200 : 201).json({
                error: false,
                success: true,
                message: existingKpiInventory.length > 0 ? "Successfully updated KPI target" : "Successfully added KPI target"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: "internal server error " + error.message, success: false });
    }
};

exports.getKpiInventoryByFacilityIdAndYear = async (req, res) => {
    try {
        const { facility_id, year } = req.body;
        const schema = Joi.object({
            facility_id: Joi.string().required(),
            year: Joi.string().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const getKpiInventory = await kpiModel.getKpiInventoryJsonByFacilitityAndYear(facility_id, year);

            return res.status(200).json({
                error: getKpiInventory.length > 0 ? false : true,
                message: getKpiInventory.length > 0 ? "Successfully retrieved KPI inventory" : "No KPI inventory found",
                success: getKpiInventory.length > 0 ? true : false,
                user_name: getKpiInventory.length > 0
                    ? [
                        getKpiInventory[0].firstname !== 'null' && getKpiInventory[0].firstname ? getKpiInventory[0].firstname : '',
                        getKpiInventory[0].lastname !== 'null' && getKpiInventory[0].lastname ? getKpiInventory[0].lastname : ''
                    ].join(' ').trim()
                    : '',
                updated_at: getKpiInventory.length > 0 ? getKpiInventory[0].updated_at : '',
                data: getKpiInventory.length > 0 ? JSON.parse(getKpiInventory[0].inventory_json) : []
            });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "internal server error " + error.message, success: false });
    }
};

exports.getKpiInventoryByFacilityIdAndYearAndKpiId = async (req, res) => {
    try {
        const { facility_id, base_year, current_year, kpi_id } = req.body;
        const schema = Joi.object({
            facility_id: Joi.string().required(),
            base_year: Joi.string().required(),
            current_year: Joi.string().required(),
            kpi_id: Joi.string().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        }

        const facilityIds = facility_id.split(',').map(id => parseInt(id));
        const kpiIds = kpi_id.split(',').map(id => parseInt(id));

        const getKpiInventory = await kpiModel.getKpiInventoryByFacilityIdAndYearAndKpiId(facility_id, base_year, current_year, kpi_id);
        const baseData = getKpiInventory.base_year_data || [];
        const currentData = getKpiInventory.current_year_data || [];

        const groupedData = {};

        for (const fId of facilityIds) {
            groupedData[fId] = [];

            for (const kId of kpiIds) {
                const baseEntry = baseData.find(item => item.facility_id === fId && item.kpi_item_id === kId);
                const currentEntry = currentData.find(item => item.facility_id === fId && item.kpi_item_id === kId);

                groupedData[fId].push({
                    kpi_item_id: kId,
                    kpi_name: baseEntry?.kpi_name || currentEntry?.kpi_name || null,
                    kpi_unit: baseEntry?.unit || currentEntry?.unit || null,
                    base_year: baseEntry?.base_year || base_year,
                    base_year_annual: Number(baseEntry?.annual) || null,
                    current_year: currentEntry?.base_year || current_year,
                    current_year_annual: Number(currentEntry?.annual) || null,
                    facility_id: fId,
                    facility_name: baseEntry?.AssestName || currentEntry?.AssestName || null
                });
            }
        }

        const finalOutput = {
            facility: Object.values(groupedData)
        };

        return res.status(200).json({
            error: false,
            message: "Successfully retrieved KPI inventory",
            success: true,
            data: finalOutput
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error: " + error.message,
            success: false
        });
    }
};

exports.getKpiInventoryDashboard = async (req, res) => {
    try {
        const { facilities, formatType, startDate, endDate, format, kpiIds } = req.body;
        const schema = Joi.object({
            facilities: Joi.string().required(),
            formatType: Joi.string().required().allow('Aggregate', 'Compare'),
            startDate: Joi.string().optional().allow(null, ''),
            endDate: Joi.string().optional().allow(null, ''),
            format: Joi.string().required().allow('Annually', 'Quarterly', 'Monthly'),
            kpiIds: Joi.string().required().allow(null, '')
        });

        const result = schema.validate(req.body);
        if (result.error) {
            const errorMessage = result.error.details.map((i) => i.message).join(", ");
            return res.status(400).json({
                message: errorMessage,
                error: errorMessage,
                missingParams: result.error.details.map((i) => i.path.join(".")),
                status: 400,
                success: false,
            });
        } else {
            const user_id = req.user.user_id;
            let getKpiInvetoryResponse;
            if (formatType == 'Aggregate') {
                if (format == 'Annually') {
                    getKpiInvetoryResponse = await kpiModel.getKpiInventoryAggregateDataAnnually(facilities, startDate, endDate, kpiIds, user_id);
                } else if (format == 'Quaterly') {
                    getKpiInvetoryResponse = await kpiModel.getKpiInventoryAggregateDataQuaterly(facilities, kpiIds, user_id);
                } else {
                    getKpiInvetoryResponse = await kpiModel.getKpiInventoryAggregateDataMonthly(facilities, kpiIds, user_id);
                }
            } else {
                getKpiInvetoryResponse = await kpiModel.getKpiInventoryCompareDataAnnually(facilities, kpiIds)
            }

            return res.status(200).json({ error: false, message: "Successfully get dashboard kpi", success: true, data: getKpiInvetoryResponse })
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false })
    }
};

const fillMissingYears = (data, baseYear, currentYear) => {
    const yearSet = new Set(data.map(item => Number(item.category)));

    for (let year = Number(baseYear); year <= Number(currentYear); year++) {
        if (!yearSet.has(year)) {
            data.push({
                emission: 0,
                category: year,
            });
        }
    }

    return data.sort((a, b) => a.category - b.category);
};

exports.getKpiInventoryEmissionIntensity = async (req, res) => {
    try {
        const { facilities, base_year, current_year } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                facilities: [Joi.string().empty().required()],
                base_year: [Joi.string().empty().required()],
                current_year: [Joi.string().empty().required()],
            })
        );
        const result = schema.validate(req.body);
        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 200,
                success: false,
            });
        } else {
            if (facilities) {
                let facilitiesdata = facilities !== "0" ? facilities : "0";

                const ghgData = await kpiModel.kpiInventoryGhgEmission(facilitiesdata, base_year, current_year);
                const revenueData = await kpiModel.kpiInventoryRevenue(facilitiesdata, base_year, current_year);

                const emissionResult = ghgData
                    .map(item => ({
                        YEAR: Number(item.Year || item.year || item.YEAR),
                        emission: Number(item.annual) || 0
                    }))
                    .reduce((acc, { YEAR, emission }) => {
                        if (!isNaN(YEAR) && !isNaN(emission)) {
                            acc[YEAR] = (acc[YEAR] || 0) + emission;
                        }
                        return acc;
                    }, {});

                let resultArray = Object.entries(emissionResult).map(([year, emission]) => ({
                    emission,
                    category: Number(year)
                })).sort((a, b) => a.category - b.category);

                resultArray = fillMissingYears(resultArray, base_year, current_year);

                const revenueResult = revenueData
                    .map(item => ({
                        YEAR: Number(item.Year || item.year || item.YEAR),
                        emission: Number(item.annual) || 0
                    }))
                    .reduce((acc, { YEAR, emission }) => {
                        if (!isNaN(YEAR) && !isNaN(emission)) {
                            acc[YEAR] = (acc[YEAR] || 0) + emission;
                        }
                        return acc;
                    }, {});

                let resultArray1 = Object.entries(revenueResult).map(([year, emission]) => ({
                    emission,
                    category: Number(year)
                })).sort((a, b) => a.category - b.category);

                resultArray1 = fillMissingYears(resultArray1, base_year, current_year);

                return res.json({
                    success: true,
                    message: "Succesfully fetched category",
                    status: 200,
                    ghg_emission: resultArray,
                    revenue: resultArray1
                });
            }
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false });
    }
};