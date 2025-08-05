
const Joi = require("joi");

const { getSelectedColumn } = require("../models/common");

const { getFacilitiesAreaByFacilityId, getCombustionEmission, Allrefrigerants, Allfireextinguisher, getAllcompanyownedvehicles, getAllelectricity, getAllheatandsteam, purchaseGoodsDetails, goodsServicesDetails, capitalGoodsDetails, flight_travelDetails, hotel_stayDetails, other_modes_of_transportDetails, processing_of_sold_products_categoryDetails, getAllCoal, sold_product_categoryDetails, endoflife_waste_typeDetails, water_supply_treatment_categoryDetails, employee_commuting_categoryDetails, homeoffice_categoryDetails, waste_generated_emissionsDetails, upstreamLease_emissionDetails, downstreamLease_emissionDetails, franchise_categories_emissionDetails, investment_emissionsDetails, upstream_vehicle_storage_emissions, downstream_vehicle_storage_emissions, waste_generated_emissionsDetailsEmssion, waste_generated_emissionsDetailsEmssionByMethodemission, getTop3CombustionEmission, getCombustionEmissionData, getRefrigerantEmissionData, getExtinguisherEmissionData, getDieselPassengerData, getPetrolPassengerData, getDieselDeliveryData, getOtherDeliveryData, fetchRenewableElectricityde, purchaseGoodAndServicesModel, getWasteData, flightTravel, modeOfTransport, hotelStay, employeeCommute, getCombustionEmissionDetail, getCombustionEmissionDetailFixed, getscope1CombustionEmissionDetail, getCombustionEmissionRangeWise, AllrefrigerantsRangeWise, AllfireextinguisherRangeWise, getAllcompanyownedvehiclesRangeWise, getAllelectricityRangeWise, getAllheatandsteamRangeWise, purchaseGoodsDetailsRangeWise, flight_travelDetailsRangeWise, hotel_stayDetailsRangeWise, other_modes_of_transportDetailsRangeWise, processing_of_sold_products_categoryDetailsRangeWise, sold_product_categoryDetailsRangeWise, endoflife_waste_typeDetailsRangeWise, water_supply_treatment_categoryDetailsRangeWise, employee_commuting_categoryDetailsRangeWise, homeoffice_categoryDetailsRangeWise, waste_generated_emissionsDetailsRangeWise, upstreamLease_emissionDetailsRangeWise, downstreamLease_emissionDetailsRangeWise, franchise_categories_emissionDetailsRangeWise, investment_emissionsDetailsRangeWise, upstream_vehicle_storage_emissionsRangeWise, downstream_vehicle_storage_emissionsRangeWise, employeePerEmission, findStationaryCombustionde, findRefrigerant, findFireextinguisherde, findVehiclede, findRenewableelectricityde, findSubCategoryTypes, findSubCategoryTypesByCategoryId } = require("../models/ghgEmissionReport");

exports.GhgScopewiseEmssion = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                facilities: [Joi.string().empty().required()],
                year: [Joi.string().empty().required()],
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
            let month = [
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
            let monthlyData = {};
            let monthlyData1 = {};
            let monthlyData2 = {};
            month.forEach((month) => {
                monthlyData[month] = 0;
                monthlyData1[month] = 0;
                monthlyData2[month] = 0;
            });
            let categoryTotals = {};
            let categoryTotals2 = {};
            let categoryTotals3 = {};
            let array1 = [];
            let array2 = [];
            let array3 = [];

            let categorydata, categorydata2, categorydata3, categorydata4, categorydata5, categorydata6, categorydata7, categorydata8, categorydata9, categorydata10, categorydata11, categorydata12, categorydata13, categorydata14, categorydata15, categorydata16, categorydata17, categorydata18, categorydata19, categorydata20, categorydata21 = "";

            let sum = 0;
            let sum1 = 0;
            let sum2 = 0;
            let sum_quantity = 0;
            let sum_quantity2 = 0;
            let sum_quantity3 = 0;
            if (facilities) {
                let facilitiesdata = facilities !== "0" ? facilities : "0";
                const facilities_area = await getFacilitiesAreaByFacilityId(facilitiesdata)
                categorydata = await getCombustionEmission(facilitiesdata, year);
                categorydata2 = await Allrefrigerants(facilitiesdata, year);
                categorydata3 = await Allfireextinguisher(facilitiesdata, year);
                categorydata4 = await getAllcompanyownedvehicles(facilitiesdata, year);
                array1 = [
                    ...categorydata,
                    ...categorydata2,
                    ...categorydata3,
                    ...categorydata4,
                ];
                if (array1.length > 0) {
                    await Promise.all(
                        array1.map(async (item) => {
                            if (item.month_number &&
                                monthlyData.hasOwnProperty(item.month_number)) {
                                let category = item.category;
                                if (!categoryTotals[category]) {
                                    categoryTotals[category] = 0;
                                }
                                categoryTotals[category] += parseFloat(item.emission);
                            }
                        })
                    );
                }
                const resultArray = Object.keys(categoryTotals).map((category) => ({
                    emission: parseFloat(categoryTotals[category].toFixed(1)),
                    category,
                    scope: "scope1",
                }));

                categorydata5 = await getAllelectricity(facilitiesdata, year);
                categorydata6 = await getAllheatandsteam(facilitiesdata, year);
                array2 = [...categorydata5, ...categorydata6];
                if (array2) {
                    await Promise.all(
                        array2.map(async (item) => {
                            if (item.month_number &&
                                monthlyData1.hasOwnProperty(item.month_number)) {
                                let category = item.category;
                                if (!categoryTotals2[category]) {
                                    categoryTotals2[category] = 0;
                                }
                                categoryTotals2[category] += parseFloat(item.emission);
                            }
                        })
                    );
                }
                const resultArray1 = Object.keys(categoryTotals2).map((category) => ({
                    emission: parseFloat(categoryTotals2[category].toFixed(1)),
                    category,
                    scope: "scope2",
                }));

                categorydata7 = await purchaseGoodsDetails(facilitiesdata, year);
                categorydata8 = await flight_travelDetails(facilitiesdata, year);
                let hotelstayDetails = await hotel_stayDetails(facilitiesdata, year);
                let othermodes_of_transportDetails = await other_modes_of_transportDetails(facilitiesdata, year);

                categorydata9 = await processing_of_sold_products_categoryDetails(
                    facilitiesdata,
                    year
                );
                categorydata10 = await sold_product_categoryDetails(
                    facilitiesdata,
                    year
                );
                categorydata11 = await endoflife_waste_typeDetails(
                    facilitiesdata,
                    year
                );
                categorydata12 = await water_supply_treatment_categoryDetails(
                    facilitiesdata,
                    year
                );

                categorydata13 = await employee_commuting_categoryDetails(
                    facilitiesdata,
                    year
                );

                categorydata14 = await homeoffice_categoryDetails(facilitiesdata, year);

                categorydata15 = await waste_generated_emissionsDetails(
                    facilitiesdata,
                    year
                );

                categorydata16 = await upstreamLease_emissionDetails(
                    facilitiesdata,
                    year
                );

                categorydata17 = await downstreamLease_emissionDetails(
                    facilitiesdata,
                    year
                );
                categorydata18 = await franchise_categories_emissionDetails(
                    facilitiesdata,
                    year
                );

                categorydata19 = await investment_emissionsDetails(
                    facilitiesdata,
                    year
                );

                categorydata20 = await upstream_vehicle_storage_emissions(
                    facilitiesdata,
                    year
                );

                categorydata21 = await downstream_vehicle_storage_emissions(
                    facilitiesdata,
                    year
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
                            if (item.month_number &&
                                monthlyData2.hasOwnProperty(item.month_number)) {
                                let category = item.category;
                                if (!categoryTotals3[category]) {
                                    categoryTotals3[category] = 0;
                                }
                                let emssion = parseFloat(item.emission);
                                categoryTotals3[category] += emssion;
                            }
                        })
                    );
                }

                if (categorydata.length > 0) {
                    for (item of categorydata) {
                        if (item.month_number &&
                            monthlyData2.hasOwnProperty(item.month_number)) {
                            monthlyData2[item.month_number] += parseFloat(
                                item?.scope3_emission ? item?.scope3_emission : 0
                            );
                            let emissionFixed = parseFloat(
                                item?.scope3_emission ? item?.scope3_emission : 0
                            );

                            let category = item.category;
                            if (!categoryTotals3[category]) {
                                categoryTotals3[category] = 0;
                            }
                            categoryTotals3[category] += emissionFixed;
                        }
                    }
                }

                if (categorydata5.length > 0) {
                    for (item of categorydata5) {
                        if (item.month_number &&
                            monthlyData2.hasOwnProperty(item.month_number)) {
                            monthlyData2[item.month_number] += parseFloat(
                                item?.scope3_emission ? item?.scope3_emission : 0
                            );
                            let emissionFixed = parseFloat(
                                item?.scope3_emission ? item?.scope3_emission : 0
                            );

                            let category = item.category;
                            if (!categoryTotals3[category]) {
                                categoryTotals3[category] = 0;
                            }
                            categoryTotals3[category] += emissionFixed;
                        }
                    }
                }

                if (categorydata6.length > 0) {
                    for (item of categorydata6) {
                        if (item.month_number &&
                            monthlyData2.hasOwnProperty(item.month_number)) {
                            monthlyData2[item.month_number] += parseFloat(
                                item?.scope3_emission ? item?.scope3_emission : 0
                            );
                            let emissionFixed = parseFloat(
                                item?.scope3_emission ? item?.scope3_emission : 0
                            );

                            let category = item.category;
                            if (!categoryTotals3[category]) {
                                categoryTotals3[category] = 0;
                            }
                            categoryTotals3[category] += emissionFixed;
                        }
                    }
                }

                const combinedCategories = ['Stationary Combustion', 'Electricity', 'Heat and Steam'];

                let combinedEmission = 0;
                let combinedEmission1 = 0;
                const resultArray2 = [];

                Object.keys(categoryTotals3).forEach((category) => {
                    const emission = categoryTotals3[category];

                    if (combinedCategories.includes(category)) {
                        combinedEmission += emission;
                    } else {
                        resultArray2.push({
                            emission: parseFloat(emission.toFixed(3) / 1000),
                            category,
                            scope: "scope3",
                        });
                    }
                });

                if (combinedEmission > 0) {
                    resultArray2.unshift({
                        emission: parseFloat(combinedEmission.toFixed(3) / 1000),
                        category: 'Fuel and Energy-related Activities',
                        scope: 'scope3',
                    });
                }

                let newDAta = [];
                let newDAta2 = [];
                let newDAta3 = [];

                for (let category in categoryTotals) {
                    newDAta.push(
                        `${category} - ${parseFloat(
                            categoryTotals[category] / 1000
                        ).toFixed(3)} Tonnes`
                    );
                }

                for (let category in categoryTotals2) {
                    newDAta2.push(
                        `${category} - ${parseFloat(
                            categoryTotals2[category] / 1000
                        ).toFixed(3)} Tonnes`
                    );
                }

                for (let category in categoryTotals3) {
                    const emission = parseFloat(categoryTotals3[category]);
                    if (combinedCategories.includes(category)) {
                        combinedEmission1 += emission;
                    } else {
                        newDAta3.push(
                            `${category} - ${(emission / 1000).toFixed(3)} Tonnes`
                        );
                    }
                }

                if (combinedEmission1 > 0) {
                    newDAta3.unshift(
                        `Fuel and Energy-related Activities - ${(combinedEmission1 / 1000).toFixed(3)} Tonnes`
                    );
                }

                const totalScope1Emission = resultArray.reduce((sum, item) => sum + item.emission, 0);
                const updatedScope1Data = [{ total_emission: (totalScope1Emission / 1000).toFixed(4) }, ...resultArray];

                const totalScope2Emission = resultArray1.reduce((sum, item) => sum + item.emission, 0);
                const updatedScope2Data = [{ total_emission: (totalScope2Emission / 1000).toFixed(4) }, ...resultArray1];

                const totalScope3Emission = resultArray2.reduce((sum, item) => sum + item.emission, 0);
                const updatedScope3Data = [{ total_emission: (totalScope3Emission / 1000).toFixed(4) }, ...resultArray2];

                categorydata15 = await waste_generated_emissionsDetailsEmssion(
                    facilitiesdata,
                    year
                );
                let unit = "";
                if (categorydata15) {
                    await Promise.all(
                        categorydata15.map(async (item) => {
                            let total_waste = parseFloat(item.total_waste);
                            let emission = parseFloat(item.emission / 1000);
                            unit = item.unit;
                            sum1 += total_waste;

                            if (item.method == "reuse") {
                                let total_waste = parseFloat(item.total_waste);
                                sum_quantity += total_waste;
                            }

                            if (item.method == "composting") {
                                let total_waste = parseFloat(item.total_waste);
                                sum_quantity2 += total_waste;
                            }

                            if (item.method == "recycling") {
                                let total_waste = parseFloat(item.total_waste);
                                sum_quantity3 += total_waste;
                            }
                            sum2 += emission;
                        })
                    );
                }

                let waste1 =
                    await waste_generated_emissionsDetailsEmssionByMethodemission(
                        facilitiesdata,
                        year,
                        "reuse"
                    );

                let waste2 =
                    await waste_generated_emissionsDetailsEmssionByMethodemission(
                        facilitiesdata,
                        year,
                        "composting"
                    );

                let waste3 =
                    await waste_generated_emissionsDetailsEmssionByMethodemission(
                        facilitiesdata,
                        year,
                        "recycling"
                    );

                let sumreuse = waste1[0]?.["emission"]
                    ? parseFloat(waste1[0]["emission"] / 1000)
                    : 0;

                let sumcomposted = waste2[0]?.["emission"]
                    ? parseFloat(waste2[0]["emission"] / 1000)
                    : 0;

                let recycling = waste3[0]?.["emission"]
                    ? parseFloat(waste3[0]["emission"] / 1000)
                    : 0;

                let array4 = [];

                array4.push(sumreuse, sumcomposted, recycling);

                const sumtotal3 = array4.reduce((acc, curr) => acc + curr, 0);

                let totalsum = parseFloat(sum1).toFixed(1);

                let diverted =
                    (parseFloat(sum_quantity + sum_quantity2 + sum_quantity3) /
                        parseFloat(sum1)) *
                    100;

                let diverted_emssion = diverted;

                let totalsum1 = parseFloat(sum2).toFixed(4);

                return res.json({
                    success: true,
                    message: "Succesfully fetched category",
                    Scope1: updatedScope1Data,
                    Scope2: updatedScope2Data,
                    Scope3: updatedScope3Data,
                    seriesScope1: Object.values(categoryTotals).map((num) => parseFloat(num.toFixed(1) / 1000)
                    ),
                    labelScope1: newDAta,
                    seriesScope2: Object.values(categoryTotals2).map((num) => parseFloat(num.toFixed(1) / 1000)
                    ),
                    labelScope2: newDAta2,
                    seriesScope3: resultArray2.map((val) => parseFloat((val.emission / 1000).toFixed(4))),
                    labelScope3: newDAta3,
                    waste_disposed: parseFloat(totalsum),
                    waste_disposed_unit: unit,
                    waste_emissions: parseFloat(totalsum1),
                    waste_emissions_unit: "Tonnes",
                    diverted_emssion: parseFloat(diverted_emssion ? diverted_emssion : 0).toFixed(2),
                    diverted_emssion_unit: "%",
                    area: facilities_area[0].area,
                    status: 200,
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: "Internal server error " + err.message,
            error: err,
            status: 500,
        });
    }
};

exports.GhgdashboardWasteTotal = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                facilities: [Joi.string().empty().required()],
                year: [Joi.string().empty().required()],
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
            let categorydata15 = "";
            let sum1 = 0;
            let sum2 = 0;
            let sum_quantity = 0;
            let sum_quantity2 = 0;
            let sum_quantity3 = 0;
            if (facilities) {
                let facilitiesdata = facilities !== "0" ? facilities : "0";

                categorydata15 = await waste_generated_emissionsDetailsEmssion(
                    facilitiesdata,
                    year
                );
                let unit = "";
                if (categorydata15) {
                    await Promise.all(
                        categorydata15.map(async (item) => {
                            let total_waste = parseFloat(item.total_waste);
                            let emission = parseFloat(item.emission / 1000);
                            unit = item.unit;
                            sum1 += total_waste;

                            if (item.method == "reuse") {
                                let total_waste = parseFloat(item.total_waste);
                                sum_quantity += total_waste;
                            }

                            if (item.method == "composting") {
                                let total_waste = parseFloat(item.total_waste);
                                sum_quantity2 += total_waste;
                            }

                            if (item.method == "recycling") {
                                let total_waste = parseFloat(item.total_waste);
                                sum_quantity3 += total_waste;
                            }
                            sum2 += emission;
                        })
                    );
                }

                let waste1 =
                    await waste_generated_emissionsDetailsEmssionByMethodemission(
                        facilitiesdata,
                        year,
                        "reuse"
                    );

                let waste2 =
                    await waste_generated_emissionsDetailsEmssionByMethodemission(
                        facilitiesdata,
                        year,
                        "composting"
                    );

                let waste3 =
                    await waste_generated_emissionsDetailsEmssionByMethodemission(
                        facilitiesdata,
                        year,
                        "recycling"
                    );

                let sumreuse = waste1[0]?.["emission"]
                    ? parseFloat(waste1[0]["emission"] / 1000)
                    : 0;

                let sumcomposted = waste2[0]?.["emission"]
                    ? parseFloat(waste2[0]["emission"] / 1000)
                    : 0;

                let recycling = waste3[0]?.["emission"]
                    ? parseFloat(waste3[0]["emission"] / 1000)
                    : 0;

                let array3 = [];

                array3.push(sumreuse, sumcomposted, recycling);

                const sumtotal3 = array3.reduce((acc, curr) => acc + curr, 0);

                let totalsum = parseFloat(sum1).toFixed(1);

                let diverted =
                    (parseFloat(sum_quantity + sum_quantity2 + sum_quantity3) /
                        parseFloat(sum1)) *
                    100;

                let diverted_emssion = diverted;

                let totalsum1 = parseFloat(sum2).toFixed(4);

                return res.json({
                    success: true,
                    message: "Succesfully fetched category",
                    waste_disposed: parseFloat(totalsum) + " " + unit,
                    waste_emissions: parseFloat(totalsum1) + " " + "Tonnes",
                    diverted_emssion:
                        parseFloat(diverted_emssion ? diverted_emssion : 0).toFixed(2) +
                        " " +
                        "%",
                    status: 200,
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: "Internal server error " + err.message,
            error: err,
            status: 500,
        });
    }
};

exports.getTopCombustionEmission = async (req, res) => {
    try {
        const { facilities, year } = req.body;

        const schema = Joi.object({
            facilities: Joi.string().empty().required(),
            year: Joi.string().empty().required(),
        });

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
        }

        let myArray = facilities.split(",");
        let topEmissions = [];

        for (let item of myArray) {
            let top = await getTop3CombustionEmission(item, year);
            if (top.length > 0) {
                topEmissions.push(...top);
            }
        }

        // Summing emissions by TypeName
        const summedEmissions = topEmissions.reduce((acc, curr) => {
            let existing = acc.find(item => item.TypeName === curr.TypeName);
            if (existing) {
                existing.Total_GHGEmission += parseFloat(curr.Total_GHGEmission);
            } else {
                acc.push({
                    TypeName: curr.TypeName,
                    Total_GHGEmission: parseFloat(curr.Total_GHGEmission)
                });
            }
            return acc;
        }, []);

        // Sorting and selecting top 3 emissions
        const top3SummedEmissions = summedEmissions
            .sort((a, b) => b.Total_GHGEmission - a.Total_GHGEmission)
            .slice(0, 3);

        return res.status(200).json({
            success: true,
            message: "Top 3 GHG Emission records fetched successfully",
            data: top3SummedEmissions
        });

    } catch (error) {
        console.error("Error fetching top combustion emissions:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }

};

exports.fetchScope1EmissionData = async (req, res) => {
    try {
        const { facilityIds, year } = req.body;

        const schema = Joi.object({
            facilityIds: Joi.string().empty().required(),
            year: Joi.string().empty().required(),
        });

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
        }

        // Fetch emission data
        const facilitiesArray = facilityIds.split(',').map(id => parseInt(id.trim()));
        const CombustionEmissionData = await getCombustionEmissionData(facilitiesArray, year);
        const [RefrigerantEmissionData = null] = await getRefrigerantEmissionData(facilitiesArray, year);
        const [ExtinguisherEmissionData = null] = await getExtinguisherEmissionData(facilitiesArray, year);
        const [DieselPassengerData = null] = await getDieselPassengerData(facilitiesArray, year);
        const [PetrolPassengerData = null] = await getPetrolPassengerData(facilitiesArray, year);
        const [DieselDeliveryData = null] = await getDieselDeliveryData(facilitiesArray, year);
        const [otherDeliveryData = null] = await getOtherDeliveryData(facilitiesArray, year);

        // Send response
        res.status(200).json({
            error: false, success: true, data: {
                CombustionEmissionData, RefrigerantEmissionData, ExtinguisherEmissionData, DieselPassengerData, PetrolPassengerData, DieselDeliveryData, otherDeliveryData
            }, message: "Successfully found emisions"
        });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
};

/**
 * @DEVELOPER KARAN PATEL
 * @DATE 18-03-2025
 * 
  */

exports.fetchScope2Comission = async (req, res) => {
    try {
        const { faciltyId, year } = req.body;
        const schema = Joi.object({
            faciltyId: Joi.string()
                .pattern(/^\d+(,\d+)*$/)
                .required()
                .messages({
                    "string.pattern.base": "facilityId must be a comma-separated list of numbers.",
                    "any.required": "facilityId is required.",
                }),
            year: Joi.number().integer().required().messages({
                "any.required": "Year is required.",
            }),
        });
        const result = schema.validate(req.body);
        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        }
        const faciltyDetails = await fetchRenewableElectricityde(faciltyId, year);
        if (faciltyDetails.length !== 0) {
            const electricity = faciltyDetails.filter(item => item.SubCategorySeedID === 9);
            const recSolar = faciltyDetails.filter(item =>
                item.SubCategorySeedID === 1002 && item.SourceName !== null && item.SourceName.toLowerCase() === 'solar'
            );
            const recWind = faciltyDetails.filter(item =>
                item.SubCategorySeedID === 1002 && item.SourceName !== null && item.SourceName.toLowerCase() === 'wind'
            );

            const electricitySum = electricity.reduce((acc, curr) => {
                return acc + (parseFloat(curr.GHGEmission) || 0);
            }, 0);
            const recSolarSum = recSolar.reduce((acc, curr) => {
                return acc + (parseFloat(curr.GHGEmission) || 0);
            }, 0);

            const recWindSum = recWind.reduce((acc, curr) => {
                return acc + (parseFloat(curr.GHGEmission) || 0);
            }, 0);
            const totalValue = electricitySum + recSolarSum + recWindSum;
            const electricityData = {
                // data: electricity,
                totalGHGEmission: (electricitySum / 1000).toFixed(4)
            };
            const recSolarData = {
                // data: recSolar,
                totalGHGEmission: (recSolarSum / 1000).toFixed(4)
            };
            const recWindData = {
                // data: recWind,
                totalGHGEmission: (recWindSum / 1000).toFixed(4)
            };
            return res.json({
                status: 200,
                message: "data found successfully",
                success: true,
                data: {
                    electricity: electricityData,
                    recSolar: recSolarData,
                    recWind: recWindData,
                    total: (totalValue / 1000).toFixed(4)
                }
            });
        } else {
            return res.json({
                message: "Facility list is empty or not provided.",
                status: 502,
                success: false,
            });
        }
    } catch (error) {
        console.log(error, "<==error");
        return res.json({
            message: "Internal server error",
            status: 500,
            success: false,
        });
    }
};

exports.purchaseGoodAndService = async (req, res) => {
    try {
        const { faciltyId, year } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                faciltyId: [Joi.string().empty().required()],
                year: [Joi.string().empty().required()],
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
        }
        let purchaseGoodDetailsByTypeOfPurchase3 = await purchaseGoodAndServicesModel(faciltyId, year, 3);
        purchaseGoodDetailsByTypeOfPurchase3 = purchaseGoodDetailsByTypeOfPurchase3.length > 0 ? purchaseGoodDetailsByTypeOfPurchase3 : []

        let purchaseGoodDetailsByTypeOfPurchase2 = await purchaseGoodAndServicesModel(faciltyId, year, 2);
        purchaseGoodDetailsByTypeOfPurchase2 = purchaseGoodDetailsByTypeOfPurchase2.length > 0 ? purchaseGoodDetailsByTypeOfPurchase2 : []

        let purchaseGoodDetailsByTypeOfPurchase1 = await purchaseGoodAndServicesModel(faciltyId, year, 1);
        purchaseGoodDetailsByTypeOfPurchase1 = purchaseGoodDetailsByTypeOfPurchase1.length > 0 ? purchaseGoodDetailsByTypeOfPurchase1 : []
        return res.json({
            status: 200,
            message: "data found successfully",
            success: true,
            data: {
                purchaseGoodDetailsByTypeOfPurchase1,
                purchaseGoodDetailsByTypeOfPurchase2,
                purchaseGoodDetailsByTypeOfPurchase3,
            }
        });
    } catch (error) {
        console.log(error, "<==error");
        return res.json({
            message: "Internal server error",
            status: 500,
            success: false,
        });
    }
};

exports.Scope3WiseEmssionOnly = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                facilities: [Joi.string().empty().required()],
                year: [Joi.string().empty().required()],
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
            let month = [
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
            let monthlyData = {};
            let monthlyData1 = {};
            let monthlyData2 = {};
            month.forEach((month) => {
                monthlyData[month] = 0;
                monthlyData1[month] = 0;
                monthlyData2[month] = 0;
            });

            const predefinedCategories = ["Standard goods & services", "Capital goods", "Upstream Transportation and Distribution", "Downstream Transportation and Distribution", "Waste generated in operations", "Business Travel", "Employee Commuting", "Water Supply and Treatment", "Use of Sold Products", "Processing of Sold Products"];

            let categoryTotals3 = {};
            let array3 = [];

            let categorydata1,
                categorydata2,
                categorydata3,
                categorydata4,
                categorydata5,
                categorydata7,
                categorydata8,
                categorydata9,
                categorydata10 = "";

            if (facilities) {
                let facilitiesdata = "";
                if (facilities != "0") {
                    facilitiesdata = facilities.replace(/\[|\]/g, "");
                } else {
                    facilitiesdata = "0";
                }
                categorydata1 = await goodsServicesDetails(facilitiesdata, year);
                categorydata2 = await capitalGoodsDetails(facilitiesdata, year);
                categorydata3 = await upstream_vehicle_storage_emissions(
                    facilitiesdata,
                    year
                );
                categorydata4 = await downstream_vehicle_storage_emissions(
                    facilitiesdata,
                    year
                );
                categorydata5 = await waste_generated_emissionsDetails(
                    facilitiesdata,
                    year
                );

                let flightTravelDetails = await flight_travelDetails(facilitiesdata, year);
                let hotelstayDetails = await hotel_stayDetails(facilitiesdata, year);
                let othermodes_of_transportDetails = await other_modes_of_transportDetails(facilitiesdata, year);
                categorydata7 = await employee_commuting_categoryDetails(
                    facilitiesdata,
                    year
                );
                categorydata8 = await water_supply_treatment_categoryDetails(
                    facilitiesdata,
                    year
                );
                categorydata9 = await sold_product_categoryDetails(
                    facilitiesdata,
                    year
                );
                categorydata10 = await processing_of_sold_products_categoryDetails(
                    facilitiesdata,
                    year
                );

                array3 = [
                    ...categorydata1,
                    ...categorydata2,
                    ...categorydata3,
                    ...categorydata4,
                    ...categorydata5,
                    ...flightTravelDetails,
                    ...hotelstayDetails,
                    ...othermodes_of_transportDetails,
                    ...categorydata7,
                    ...categorydata8,
                    ...categorydata9,
                    ...categorydata10
                ];

                predefinedCategories.forEach(category => {
                    categoryTotals3[category] = 0;
                });
                console.log("array3 =>", array3);

                if (array3) {
                    await Promise.all(
                        array3.map(async (item) => {
                            if (
                                item.month_number &&
                                monthlyData2.hasOwnProperty(item.month_number)
                            ) {
                                let category = item.category;
                                if (!categoryTotals3[category]) {
                                    categoryTotals3[category] = 0;
                                }
                                let emssion = parseFloat(item.emission);
                                categoryTotals3[category] += emssion;
                            }
                        })
                    );
                }

                const resultArray2 = Object.keys(categoryTotals3).map((category) => ({
                    emission: parseFloat(categoryTotals3[category].toFixed(4) / 1000),
                    category,
                    scope: "scope3",
                }));

                return res.json({
                    success: true,
                    message: "Succesfully fetched category",
                    Scope3: resultArray2,
                    seriesScope3: Object.values(categoryTotals3).map((num) =>
                        parseFloat(num.toFixed(4) / 1000)
                    ),
                    status: 200,
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: "Internal server error",
            error: err,
            status: 500,
        });
    }
};

exports.getGhgWasteEmissionData = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                facilities: [Joi.string().empty().required()],
                year: [Joi.string().empty().required()],
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
            const wasteData = await getWasteData(facilities, year);

            return res.status(200).json({
                error: false,
                success: true,
                data: wasteData,
                message: "Successfully found "
            });
        }
    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.ghgBussinessTravelServices = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                facilities: [Joi.string().empty().required()],
                year: [Joi.string().empty().required()],
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
            const flightTravelResponse = await flightTravel(facilities, year);
            const modeOfTransportRespose = await modeOfTransport(facilities, year);
            const hotelStayResponse = await hotelStay(facilities, year);

            return res.status(200).json({ error: false, success: true, message: "Successfully found bussiness travel", data: flightTravelResponse, modeOfTransportRespose, hotelStayResponse })
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false })
    }
};

exports.ghgEmployeeCommute = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                facilities: [Joi.string().empty().required()],
                year: [Joi.string().empty().required()],
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
            const employeeCommuteResponse = await employeeCommute(facilities, year);
            let total_emission = employeeCommuteResponse.reduce((acc, data) => acc + data.subtotal_total_emission, 0);
            return res.status(200).json({ error: false, message: "Successfuly found ghg employee commute", success: true, data: employeeCommuteResponse, total_emission });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false });
    }
};

exports.ghgEnergyConsumptionWellTank = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                facilities: [Joi.string().empty().required()],
                year: [Joi.string().empty().required()],
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
            let categorydata,
                categorydata2,
                categorydata3,
                categorydata4,
                categorydata5 = "";

            categorydata = await getCombustionEmissionDetail(
                facilities,
                year,
                1
            );

            categorydata2 = await getCombustionEmissionDetail(
                facilities,
                year,
                2
            );

            categorydata3 = await getCombustionEmissionDetail(
                facilities,
                year,
                3
            );

            categorydata4 = await getCombustionEmissionDetail(
                facilities,
                year,
                4
            );

            categorydata5 = await getCombustionEmissionDetailFixed(
                facilities,
                year
            );

            let totalsum = categorydata[0].emission
                ? parseFloat(categorydata[0].emission / 1000).toFixed(3)
                : 0;
            let totalsum1 = categorydata2[0].emission
                ? parseFloat(categorydata2[0].emission / 1000).toFixed(3)
                : 0;
            let totalsum2 = categorydata3[0].emission
                ? parseFloat(categorydata3[0].emission / 1000).toFixed(3)
                : 0;
            let totalsum3 = categorydata4[0].emission
                ? parseFloat(categorydata4[0].emission / 1000).toFixed(3)
                : 0;

            let totalsum4 = categorydata5[0].emission
                ? parseFloat(categorydata5[0].emission / 1000).toFixed(3)
                : 0;

            let sumtotal1 = parseFloat(totalsum + totalsum1 + totalsum2 + totalsum3);
            let sumtotal2 = parseFloat(
                totalsum + totalsum1 + totalsum2 + totalsum3 + totalsum4
            );

            return res.json({
                success: true,
                message: "Succesfully fetched category",
                totalEmssion: sumtotal2,
                energyinuse: [sumtotal1, parseFloat(totalsum4)],
                series: ["Well to Tank Emissions", "Emissions in Energy Use"],
                status: 200,
            });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false })
    }
};

exports.ghgEnergyConsumptionMonth = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                facilities: [Joi.string().empty().required()],
                year: [Joi.string().empty().required()],
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
                monthlyData[month] = 0;
                monthlyData1[month] = 0; // Initialize all months with emission of 0
                monthlyData2[month] = 0;
            });

            let scope1month = [];
            let scope1 = [];
            let scope2month = [];
            let scope3month = [];
            let scope2 = [];
            let scope3 = [];

            let categorydata,
                categorydata5 = "";
            let sum = 0;
            let sum1 = 0;

            if (facilities) {
                categorydata = await getCombustionEmission(
                    facilities,
                    year,
                    finalyeardata
                );

                if (categorydata) {
                    await Promise.all(
                        categorydata.map(async (item) => {
                            if (
                                item.month_number &&
                                monthlyData.hasOwnProperty(item.month_number)
                            ) {
                                sum += parseFloat(item.emission);
                                monthlyData[item.month_number] += parseFloat(item.emission); // Add emission value to the corresponding month
                            }
                        })
                    );

                    scope1month.push(Object.keys(monthlyData));
                    scope1.push(
                        Object.values(monthlyData).map((num) =>
                            parseFloat(num / 1000).toFixed(3)
                        )
                    );
                }
                categorydata5 = await getAllelectricity(
                    facilities,
                    year,
                    finalyeardata
                );

                if (categorydata5) {
                    await Promise.all(
                        categorydata5.map(async (item) => {
                            if (
                                item.month_number &&
                                monthlyData1.hasOwnProperty(item.month_number)
                            ) {
                                monthlyData1[item.month_number] += parseFloat(item.emission);
                                let emissionFixed = parseFloat(item.emission);
                                sum1 += emissionFixed;
                                // Add emission value to the corresponding month
                            }
                        })
                    );
                    scope2month.push(Object.keys(monthlyData1));
                    scope2.push(
                        Object.values(monthlyData1).map((num) =>
                            parseFloat(num / 1000).toFixed(3)
                        )
                    );
                }

                let categorydata3 = [...categorydata, ...categorydata5];

                let sum3 = 0;
                if (categorydata3) {
                    await Promise.all(
                        categorydata3.map(async (item) => {
                            if (
                                item.month_number &&
                                monthlyData1.hasOwnProperty(item.month_number)
                            ) {
                                //monthlyData1[item.month_number] += parseFloat(item.emission);
                                //let emissionFixed = parseFloat(item.emission);
                                //sum3 += emissionFixed;
                                monthlyData1[item.month_number] += parseFloat(
                                    item?.scope3_emission ? item?.scope3_emission : 0
                                );
                                let emissionFixed = parseFloat(
                                    item?.scope3_emission ? item?.scope3_emission : 0
                                );
                                sum3 += emissionFixed;

                                // Add emission value to the corresponding month
                            }
                        })
                    );
                    scope3month.push(Object.keys(monthlyData1));
                    scope3.push(
                        Object.values(monthlyData1).map((num) =>
                            parseFloat(num / 1000).toFixed(3)
                        )
                    );
                }

                let series = [
                    { name: "Stationary Combustion", data: scope1[0] },
                    { name: "Electricity used", data: scope2[0] },
                    { name: "Well to Tank", data: scope3[0] },
                ];
                let sumtotal1 = sum ? parseFloat(sum.toFixed(1)) : 0;
                let sumtotal2 = sum1 ? parseFloat(sum1.toFixed(1)) : 0;
                let sumtotal3 = sum3 ? parseFloat(sum3.toFixed(1)) : 0;

                return res.json({
                    success: true,
                    message: "Succesfully fetched category",
                    scope1: sumtotal1,
                    scope2: sumtotal2,
                    scope3: sumtotal3,
                    series: series,
                    series_graph: [sumtotal1, sumtotal2, sumtotal3],
                    month: month,
                    status: 200,
                });
            }
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false })
    }
};

exports.ghgEnergyConsumption = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                facilities: [Joi.string().empty().required()],
                year: [Joi.string().empty().required()],
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
            let array1 = [];

            let categorydata,
                categorydata2,
                categorydata3,
                categorydata4 = "";
            let sum = 0;
            let sum1 = 0;
            let sum2 = 0;
            if (facilities) {

                categorydata = await getscope1CombustionEmissionDetail(
                    facilities,
                    year,
                    1
                );

                categorydata2 = await getscope1CombustionEmissionDetail(
                    facilities,
                    year,
                    2
                );

                categorydata3 = await getscope1CombustionEmissionDetail(
                    facilities,
                    year,
                    3
                );

                categorydata4 = await getscope1CombustionEmissionDetail(
                    facilities,
                    year,
                    4
                );
            };

            let totalsum = categorydata[0].emission
                ? parseFloat(categorydata[0].emission / 1000).toFixed(3)
                : 0;
            let totalsum1 = categorydata2[0].emission
                ? parseFloat(categorydata2[0].emission / 1000).toFixed(3)
                : 0;
            let totalsum2 = categorydata3[0].emission
                ? parseFloat(categorydata3[0].emission / 1000).toFixed(3)
                : 0;
            let totalsum3 = categorydata4[0].emission
                ? parseFloat(categorydata4[0].emission / 1000).toFixed(3)
                : 0;

            let sumtotal1 = parseFloat(totalsum + totalsum1 + totalsum2 + totalsum3);

            return res.json({
                success: true,
                message: "Succesfully fetched category",
                totalEmssion: sumtotal1,
                flueType: [
                    parseFloat(totalsum),
                    parseFloat(totalsum1),
                    parseFloat(totalsum2),
                    parseFloat(totalsum3),
                ],
                series: ["Liquid", "Gas", "Solid", "Bioenergy"],
                status: 200,
            });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false })
    }
};

exports.ghgTopEmissionGenerating = async (req, res) => {
    try {
        const { facilities, year } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                facilities: [Joi.string().empty().required()],
                year: [Joi.string().empty().required()],
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
            let month = [
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
            let monthlyData = {};
            let monthlyData1 = {};
            let monthlyData2 = {};
            month.forEach((month) => {
                monthlyData[month] = 0;
                monthlyData1[month] = 0;
                monthlyData2[month] = 0;
            });

            const predefinedCategories1 = ["Coal"];
            const predefinedCategories2 = ["Electricity"];
            const predefinedCategories3 = ["Standard goods & services", "Capital goods", "Downstream Transportation and Distribution"];

            let categoryTotals1 = {};
            let array1 = [];
            let categoryTotals2 = {};
            let array2 = [];
            let categoryTotals3 = {};
            let array3 = [];

            let categorydata1,
                categorydata2,
                categorydata3,
                categorydata4,
                categorydata5,
                categorydata7,
                categorydata8,
                categorydata9,
                categorydata10,
                categorydata11,
                categorydata12 = "";

            if (facilities) {
                let facilitiesdata = "";
                if (facilities != "0") {
                    facilitiesdata = facilities.replace(/\[|\]/g, "");
                } else {
                    facilitiesdata = "0";
                }
                categorydata1 = await goodsServicesDetails(facilitiesdata, year);
                categorydata2 = await capitalGoodsDetails(facilitiesdata, year);
                categorydata3 = await upstream_vehicle_storage_emissions(
                    facilitiesdata,
                    year
                );
                categorydata4 = await downstream_vehicle_storage_emissions(
                    facilitiesdata,
                    year
                );
                categorydata5 = await waste_generated_emissionsDetails(
                    facilitiesdata,
                    year
                );
                let flightTravelDetails = await flight_travelDetails(facilitiesdata, year);
                let hotelstayDetails = await hotel_stayDetails(facilitiesdata, year);
                let othermodes_of_transportDetails = await other_modes_of_transportDetails(facilitiesdata, year);
                categorydata7 = await employee_commuting_categoryDetails(
                    facilitiesdata,
                    year
                );
                categorydata8 = await water_supply_treatment_categoryDetails(
                    facilitiesdata,
                    year
                );
                categorydata9 = await sold_product_categoryDetails(
                    facilitiesdata,
                    year
                );
                categorydata10 = await processing_of_sold_products_categoryDetails(
                    facilitiesdata,
                    year
                );
                categorydata11 = await getAllelectricity(facilitiesdata, year);
                categorydata12 = await getAllCoal(facilitiesdata, year);

                array1 = [
                    ...categorydata12
                ];

                array2 = [
                    ...categorydata11
                ];

                array3 = [
                    ...categorydata1,
                    ...categorydata2,
                    ...categorydata4
                ];

                predefinedCategories1.forEach(category => {
                    categoryTotals1[category] = 0;
                });

                predefinedCategories2.forEach(category => {
                    categoryTotals2[category] = 0;
                });

                predefinedCategories3.forEach(category => {
                    categoryTotals3[category] = 0;
                });

                if (array1) {
                    await Promise.all(
                        array1.map(async (item) => {
                            if (
                                item.month_number &&
                                monthlyData2.hasOwnProperty(item.month_number)
                            ) {
                                let category = item.category;
                                if (!categoryTotals1[category]) {
                                    categoryTotals1[category] = 0;
                                }
                                let emssion = parseFloat(item.emission);
                                categoryTotals1[category] += emssion;
                            }
                        })
                    );
                }

                const resultArray1 = Object.keys(categoryTotals1).map((category) => ({
                    emission: parseFloat(categoryTotals1[category].toFixed(4) / 1000),
                    category,
                    scope: "scope1",
                }));

                if (array2) {
                    await Promise.all(
                        array2.map(async (item) => {
                            if (
                                item.month_number &&
                                monthlyData2.hasOwnProperty(item.month_number)
                            ) {
                                let category = item.category;
                                if (!categoryTotals2[category]) {
                                    categoryTotals2[category] = 0;
                                }
                                let emssion = parseFloat(item.emission);
                                categoryTotals2[category] += emssion;
                            }
                        })
                    );
                }

                const resultArray2 = Object.keys(categoryTotals2).map((category) => ({
                    emission: parseFloat(categoryTotals2[category].toFixed(4) / 1000),
                    category,
                    scope: "scope2",
                }));

                if (array3) {
                    await Promise.all(
                        array3.map(async (item) => {
                            if (
                                item.month_number &&
                                monthlyData2.hasOwnProperty(item.month_number)
                            ) {
                                let category = item.category;
                                if (!categoryTotals3[category]) {
                                    categoryTotals3[category] = 0;
                                }
                                let emssion = parseFloat(item.emission);
                                categoryTotals3[category] += emssion;
                            }
                        })
                    );
                }

                const resultArray3 = Object.keys(categoryTotals3).map((category) => ({
                    emission: parseFloat(categoryTotals3[category].toFixed(4) / 1000),
                    category,
                    scope: "scope3",
                }));

                return res.json({
                    success: true,
                    message: "Succesfully fetched category",
                    Scope1: resultArray1,
                    seriesScope1: Object.values(categoryTotals1).map((num) =>
                        parseFloat(num.toFixed(4) / 1000)
                    ),
                    Scope2: resultArray2,
                    seriesScope2: Object.values(categoryTotals2).map((num) =>
                        parseFloat(num.toFixed(4) / 1000)
                    ),
                    Scope3: resultArray3,
                    seriesScope3: Object.values(categoryTotals3).map((num) =>
                        parseFloat(num.toFixed(4) / 1000)
                    ),
                    status: 200,
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: "Internal server error",
            error: err,
            status: 500,
        });
    }
};

const fillMissingYears = (data, baseYear, currentYear, scope) => {
    const yearSet = new Set(data.map(item => Number(item.category)));

    // Loop from base_year to current_year
    for (let year = Number(baseYear); year <= Number(currentYear); year++) {
        if (!yearSet.has(year)) {
            data.push({
                emission: 0,
                category: year,  // Ensure category is a number
                scope: scope
            });
        }
    }

    // Sort the array by year (category)
    return data.sort((a, b) => a.category - b.category);
};

exports.GhgScopewiseEmssionYearRangeWise = async (req, res) => {
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
            let array1 = [];
            let array2 = [];
            let array3 = [];

            let categorydata, categorydata2, categorydata3, categorydata4, categorydata5, categorydata6, categorydata7, categorydata8, categorydata9, categorydata10, categorydata11, categorydata12, categorydata13, categorydata14, categorydata15, categorydata16, categorydata17, categorydata18, categorydata19, categorydata20, categorydata21 = "";

            if (facilities) {
                let facilitiesdata = facilities !== "0" ? facilities : "0";
                categorydata = await getCombustionEmissionRangeWise(facilitiesdata, base_year, current_year)
                categorydata2 = await AllrefrigerantsRangeWise(facilitiesdata, base_year, current_year)
                categorydata3 = await AllfireextinguisherRangeWise(facilitiesdata, base_year, current_year)
                categorydata4 = await getAllcompanyownedvehiclesRangeWise(facilitiesdata, base_year, current_year);
                array1 = [
                    ...categorydata,
                    ...categorydata2,
                    ...categorydata3,
                    ...categorydata4
                ];

                const normalizedArray = array1.map(item => ({
                    YEAR: Number(item.Year || item.YEAR || item.year),
                    emission: Number(item.emission) || 0
                }));

                const summedEmissions = normalizedArray.reduce((acc, { YEAR, emission }) => {
                    if (!isNaN(YEAR) && !isNaN(emission)) {
                        acc[YEAR] = (acc[YEAR] || 0) + emission;
                    }
                    return acc;
                }, {});

                let resultArray = Object.entries(summedEmissions)
                    .map(([year, emission]) => ({
                        emission: Number(emission),
                        category: Number(year),
                        scope: "scope1"
                    }))
                    .sort((a, b) => a.category - b.category);

                resultArray = fillMissingYears(resultArray, base_year, current_year, "scope1");

                categorydata5 = await getAllelectricityRangeWise(facilitiesdata, base_year, current_year)
                categorydata6 = await getAllheatandsteamRangeWise(facilitiesdata, base_year, current_year)

                array2 = [
                    ...categorydata5,
                    ...categorydata6.map(item => ({
                        YEAR: Number(item.Year || item.year || item.YEAR),
                        emission: item.emission
                    }))
                ];

                const summedEmissions2 = array2.reduce((acc, { YEAR, emission }) => {
                    acc[YEAR] = (acc[YEAR] || 0) + emission;
                    return acc;
                }, {});

                let resultArray1 = Object.entries(summedEmissions2).map(([year, emission]) => ({
                    emission: Number(emission),
                    category: year,
                    scope: "scope2",
                })).sort((a, b) => a.category - b.category);

                resultArray1 = fillMissingYears(resultArray1, base_year, current_year, "scope2");

                categorydata7 = await purchaseGoodsDetailsRangeWise(facilitiesdata, base_year, current_year)
                categorydata8 = await flight_travelDetailsRangeWise(facilitiesdata, base_year, current_year)
                let hotelstayDetails = await hotel_stayDetailsRangeWise(facilitiesdata, base_year, current_year);
                let othermodes_of_transportDetails = await other_modes_of_transportDetailsRangeWise(facilitiesdata, base_year, current_year);

                categorydata9 = await processing_of_sold_products_categoryDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata10 = await sold_product_categoryDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata11 = await endoflife_waste_typeDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata12 = await water_supply_treatment_categoryDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);

                categorydata13 = await employee_commuting_categoryDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);

                categorydata14 = await homeoffice_categoryDetailsRangeWise(facilitiesdata, base_year, current_year);

                categorydata15 = await waste_generated_emissionsDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);

                categorydata16 = await upstreamLease_emissionDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);

                categorydata17 = await downstreamLease_emissionDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);

                categorydata18 = await franchise_categories_emissionDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);

                categorydata19 = await investment_emissionsDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);

                categorydata20 = await upstream_vehicle_storage_emissionsRangeWise(
                    facilitiesdata,
                    base_year, current_year);

                categorydata21 = await downstream_vehicle_storage_emissionsRangeWise(
                    facilitiesdata,
                    base_year, current_year);

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

                const normalizedArray3 = array3.map(item => ({
                    YEAR: Number(item.Year || item.YEAR || item.year),
                    emission: Number(item.emission) || 0
                }));

                const categoryScope3 = categorydata.map(item => ({
                    YEAR: Number(item.Year || item.YEAR || item.year),
                    emission: Number(item.scope3_emission) || 0
                }));

                const combinedArray3 = [...normalizedArray3, ...categoryScope3];

                const summedEmissions3 = combinedArray3.reduce((acc, { YEAR, emission }) => {
                    if (!isNaN(YEAR) && !isNaN(emission)) {
                        acc[YEAR] = (acc[YEAR] || 0) + emission;
                    }
                    return acc;
                }, {});

                let resultArray2 = Object.entries(summedEmissions3)
                    .map(([year, emission]) => ({
                        emission: Number(emission),
                        category: Number(year),
                        scope: "scope3"
                    }))
                    .sort((a, b) => a.category - b.category);

                resultArray2 = fillMissingYears(resultArray2, base_year, current_year, "scope3");

                return res.json({
                    success: true,
                    message: "Succesfully fetched category",
                    Scope1: resultArray,
                    Scope2: resultArray1,
                    Scope3: resultArray2,
                    status: 200,
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: "Internal server error " + err.message,
            error: err,
            status: 500,
        });
    }
};

exports.GhgEmssionYearRangeWise = async (req, res) => {
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
            let array3 = [];

            let categorydata, categorydata2, categorydata3, categorydata4, categorydata5, categorydata6, categorydata7, categorydata8, categorydata9, categorydata10, categorydata11, categorydata12, categorydata13, categorydata14, categorydata15, categorydata16, categorydata17, categorydata18, categorydata19, categorydata20, categorydata21 = "";

            if (facilities) {
                let facilitiesdata = facilities !== "0" ? facilities : "0";
                categorydata = await getCombustionEmissionRangeWise(facilitiesdata, base_year, current_year)
                categorydata2 = await AllrefrigerantsRangeWise(facilitiesdata, base_year, current_year)
                categorydata3 = await AllfireextinguisherRangeWise(facilitiesdata, base_year, current_year)
                categorydata4 = await getAllcompanyownedvehiclesRangeWise(facilitiesdata, base_year, current_year);
                categorydata5 = await getAllelectricityRangeWise(facilitiesdata, base_year, current_year)
                categorydata6 = await getAllheatandsteamRangeWise(facilitiesdata, base_year, current_year)
                categorydata7 = await purchaseGoodsDetailsRangeWise(facilitiesdata, base_year, current_year)
                categorydata8 = await flight_travelDetailsRangeWise(facilitiesdata, base_year, current_year)
                let hotelstayDetails = await hotel_stayDetailsRangeWise(facilitiesdata, base_year, current_year);
                let othermodes_of_transportDetails = await other_modes_of_transportDetailsRangeWise(facilitiesdata, base_year, current_year);
                categorydata9 = await processing_of_sold_products_categoryDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata10 = await sold_product_categoryDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata11 = await endoflife_waste_typeDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata12 = await water_supply_treatment_categoryDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata13 = await employee_commuting_categoryDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata14 = await homeoffice_categoryDetailsRangeWise(facilitiesdata, base_year, current_year);
                categorydata15 = await waste_generated_emissionsDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata16 = await upstreamLease_emissionDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata17 = await downstreamLease_emissionDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata18 = await franchise_categories_emissionDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata19 = await investment_emissionsDetailsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata20 = await upstream_vehicle_storage_emissionsRangeWise(
                    facilitiesdata,
                    base_year, current_year);
                categorydata21 = await downstream_vehicle_storage_emissionsRangeWise(
                    facilitiesdata,
                    base_year, current_year);

                array3 = [
                    ...categorydata,
                    ...categorydata2,
                    ...categorydata3,
                    ...categorydata4,
                    ...categorydata5,
                    ...categorydata6,
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

                const normalizedArray3 = array3.map(item => ({
                    YEAR: Number(item.Year || item.YEAR || item.year),
                    emission: Number(item.emission) || 0
                }));

                const categoryScope3 = categorydata.map(item => ({
                    YEAR: Number(item.Year || item.YEAR || item.year),
                    emission: Number(item.scope3_emission) || 0
                }));

                const combinedArray3 = [...normalizedArray3, ...categoryScope3];

                const summedEmissions3 = combinedArray3.reduce((acc, { YEAR, emission }) => {
                    if (!isNaN(YEAR) && !isNaN(emission)) {
                        acc[YEAR] = (acc[YEAR] || 0) + emission;
                    }
                    return acc;
                }, {});

                let resultArray2 = Object.entries(summedEmissions3)
                    .map(([year, emission]) => ({
                        emission: Number(emission).toFixed(4),
                        category: Number(year)
                    }))
                    .sort((a, b) => a.category - b.category);

                resultArray2 = fillMissingYears(resultArray2, base_year, current_year, "scope3");

                return res.json({
                    error: false,
                    success: true,
                    message: "Succesfully fetched emission year range wise",
                    data: resultArray2,
                    status: 200,
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: "Internal server error " + err.message,
            error: err,
            status: 500,
        });
    }
};

exports.GhgEmssionPerNumberOfEmployee = async (req, res) => {
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
            const employeePerEmissionResponse = await employeePerEmission(facilities, base_year, current_year);

            return res.status(200).json({ error: false, success: true, message: "Successfully found employee per emission", data: employeePerEmissionResponse });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false });
    }
};

exports.GhgEmissionFileByFacilityIdAndCatgory = async (req, res) => {
    try {
        const { facilities, category } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                facilities: [Joi.string().required()],
                category: [Joi.string().required()]
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
            let response;
            if (category == 1) {
                response = await findStationaryCombustionde(facilities);
            } else if (category == 2) {
                response = await findRefrigerant(facilities);
            } else if (category == 3) {
                response = await findFireextinguisherde(facilities);
            } else if (category == 4) {
                response = await findVehiclede(facilities);
            } else if (category == 5) {
                response = await findRenewableelectricityde(facilities)
            } else {

            }

            if (response.length > 0) {
                response.forEach(val => {
                    val.FileName = `http://192.168.29.44:4500/uploads/${val.FileName}`;
                })

                return res.status(200).json({ error: false, message: "Data found", success: true, data: response });
            } else {
                return res.status(404).json({ error: true, message: "Data not found", success: false });
            }
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false });
    }
};

exports.GhgSubcategoryTypes = async (req, res) => {
    try {
        const subCategoryTypesResponse = await findSubCategoryTypes();

        if (!subCategoryTypesResponse || subCategoryTypesResponse.length === 0) {
            return res.status(404).json({
                error: false,
                message: "No subcategory types found",
                data: [],
                success: true
            });
        }

        return res.status(200).json({
            error: false,
            message: "Subcategory types fetched successfully",
            data: subCategoryTypesResponse,
            success: true
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server error " + error.message, success: false });
    }
};

exports.GhgSubcategoryTypesByCategoryId = async (req, res) => {
    try {
        const { category_id } = req.query;
        const schema = Joi.alternatives(
            Joi.object({
                category_id: [Joi.number().required()]
            })
        );
        const result = schema.validate(req.query);
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
            const subCategoryTypesResponse = await findSubCategoryTypesByCategoryId(category_id);

            if (!subCategoryTypesResponse || subCategoryTypesResponse.length === 0) {
                return res.status(404).json({
                    error: false,
                    message: "No subcategory types found",
                    data: [],
                    success: true
                });
            }

            return res.status(200).json({
                error: false,
                message: "Subcategory types fetched successfully",
                data: subCategoryTypesResponse,
                success: true
            });
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: "Interval server error " + error.message, success: false });
    }
};