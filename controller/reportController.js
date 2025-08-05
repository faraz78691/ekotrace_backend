const Joi = require("joi");
const config = require("../config");
const jwt = require("jsonwebtoken");
const {
  getPurchaseGoodsReport,
  getDownStreamVehicleReport,
  getUpStreamVehicleReport,
  getFranchiseEmissionReport,
  getInvestmentEmissionReport,
  getStationaryCombustionReport,
  getCategoryBySeedId,
  getUpstreamLeaseEmissionReport,
  getDownstreamLeaseEmissionReport,
  getWasteGeneratedEmissionReport,
  getFlightTravelReport,
  getOtherTransportReport,
  getHotelStayReport,
  getEmployeeCommutingReport,
  getHomeOfficeReport,
  getSoldProductbyId,
  getSoldProductReport,
  getEndOfLifeTreatmentReport,
  getWasteTypebyId,
  getProOfSoldGoodsReport,
  getReferigerantbyId,
  getRefrigerantReport,
  getFireExtbyId,
  getFireExtinguisherReport,
  getElecricityReport,
  getHeatandSteamReport,
  getWaterSupplyandTreatment,
  getCompanyOwnedVehicles,
  getVehicle,
} = require("../models/report");

const {
  getPurchaseGoodsReportMulti,
  getDownStreamVehicleReportMulti,
  getUpStreamVehicleReportMulti,
  getFranchiseEmissionReportMulti,
  getInvestmentEmissionReportMulti,
  getUpstreamLeaseEmissionReportMulti,
  getDownstreamLeaseEmissionReportMulti,
  getWasteGeneratedEmissionReportMulti,
  getFlightTravelReportMulti,
  getOtherTransportReportMulti,
  getHotelStayReportMulti,
  getEmployeeCommutingReportMulti,
  getHomeOfficeReportMulti,
  getSoldProductReportMulti,
  getEndOfLifeTreatmentReportMulti,
  getProOfSoldGoodsReportMulti,
  getRefrigerantReportMulti,
  getFireExtinguisherReportMulti,
  getElecricityReportMulti,
  getHeatandSteamReportMulti,
  getWaterSupplyandTreatmentMulti,
  getStationaryCombustionReportMulti,
} = require("../models/report_multi");

const {
  getPurchaseGoodsReportMultiNew,
  getDownStreamVehicleReportMultiNew,
  getUpStreamVehicleReportMultiNew,
  getFranchiseEmissionReportMultiNew,
  getInvestmentEmissionReportMultiNew,
  getUpstreamLeaseEmissionReportMultiNew,
  getDownstreamLeaseEmissionReportMultiNew,
  getWasteGeneratedEmissionReportMultiNew,
  getFlightTravelReportMultiNew,
  getOtherTransportReportMultiNew,
  getHotelStayReportMultiNew,
  getEmployeeCommutingReportMultiNew,
  getHomeOfficeReportMultiNew,
  getSoldProductReportMultiNew,
  getEndOfLifeTreatmentReportMultiNew,
  getProOfSoldGoodsReportMultiNew,
  getRefrigerantReportMultiNew,
  getFireExtinguisherReportMultiNew,
  getElecricityReportMultiNew,
  getHeatandSteamReportMultiNew,
  getWaterSupplyNew,
  getWaterTreatmentNew,
  getStationaryCombustionReportMultiNew,
  getWaterDischarge,
  getWaterWithdrawal,
  getVendorsReportMulti,
  getVendorsReportConsole,
  getConpanyOwnedVehiclesMultiNew,
  getVendorsCount,
  getFacilitiesFromTenant,
  getVendorsEmission,
  getVendorWiseEmission,
  getEmissionByLoc,
  getWaterDischargeOnly,
  getProductGraphVendors
} = require("../models/report_multi _new");

const {
  getPurchaseGoodsReportMultiConsole,
  getDownStreamVehicleReportMultiConsole,
  getUpStreamVehicleReportMultiConsole,
  getFranchiseEmissionReportMultiConsole,
  getInvestmentEmissionReportMultiConsole,
  getUpstreamLeaseEmissionReportMultiConsole,
  getDownstreamLeaseEmissionReportMultiConsole,
  getWasteGeneratedEmissionReportMultiConsole,
  getFlightTravelReportMultiConsole,
  getOtherTransportReportMultiConsole,
  getHotelStayReportMultiConsole,
  getEmployeeCommutingReportMultiConsole,
  getHomeOfficeReportMultiConsole,
  getSoldProductReportMultiConsole,
  getEndOfLifeTreatmentReportMultiConsole,
  getProOfSoldGoodsReportMultiConsole,
  getRefrigerantReportMultiConsole,
  getFireExtinguisherReportMultiConsole,
  getElecricityReportMultiConsole,
  getHeatandSteamReportMultiConsole,
  getWaterSupplyConsole,
  getWaterTreatmentConsole,
  getStationaryCombustionReportMultiConsole,
  getWaterDischargeConsole,
  getWaterWithdrawalConsole,
  getConpanyOwnedVehiclesMultiConsole,
  getWaterDischargeOnlyConsole,
  getElecricityLocationReportMultiConsole,
} = require("../models/report_multi _consolidated");

const {
  getPurchaseGoodsReportMultiAudit,
  getConpanyOwnedVehiclesMultiAudit,
  getDownStreamVehicleReportMultiAudit,
  getUpStreamVehicleReportMultiAudit,
  getFranchiseEmissionReportMultiAudit,
  getInvestmentEmissionReportMultiAudit,
  getStationaryCombustionReportMultiAudit,
  getUpstreamLeaseEmissionReportMultiAudit,
  getDownstreamLeaseEmissionReportMultiAudit,
  getWasteGeneratedEmissionReportMultiAudit,
  getFlightTravelReportMultiAudit,
  getOtherTransportReportMultiAudit,
  getHotelStayReportMultiAudit,
  getEmployeeCommutingReportMultiAudit,
  getHomeOfficeReportMultiAudit,
  getSoldProductReportMultiAudit,
  getEndOfLifeTreatmentReportMultiAudit,
  getProOfSoldGoodsReportMultiAudit,
  getRefrigerantReportMultiAudit,
  getFireExtinguisherReportMultiAudit,
  getElecricityReportMultiAudit,
  getHeatandSteamReportMultiAudit,
  getWaterDischargeAudit,
  getWaterWithdrawalAudit,
  getWaterSupplyAudit,
  getWaterTreatmentAudit,
  getCompanyOwnedVehiclesMultiAudit,
} = require("../models/report_multi _audit");

const { getpassengervehicletypesById } = require("../models/scope1");

exports.reportFilterPurchaseGoods = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getPurchaseGoodsReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportDownStreamVehicles = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getDownStreamVehicleReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportUpStreamVehicles = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;

    const user_id = req.user.user_id;
    const reportResult = await getUpStreamVehicleReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportFranchiseEmission = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;

    const user_id = req.user.user_id;
    const reportResult = await getFranchiseEmissionReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportInvestmentEmission = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getInvestmentEmissionReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportStationaryCombustion = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    var finalReport = [];
    const reportResult = await getStationaryCombustionReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      for (elem of reportResult) {
        const categoryRes = await getCategoryBySeedId(elem.category_id);
        var tempObj = {
          category_name: categoryRes[0].item,
          subcategory: elem.subcategory,
          quantity: elem.quantity,
          unit: elem.unit,
          emission: elem.emission,
          facility: elem.facility,
          year: elem.year,
          month: elem.month,
          user_name: elem.user_name,
        };
        if (
          elem.BlendType != "" &&
          elem.BlendType != undefined &&
          elem.BlendType != null
        ) {
          tempObj.blend_type = elem.BlendType;
          tempObj.blend_percentage = elem.BlendPercent;
        }
        finalReport.push(tempObj);
      }
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: finalReport,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportUpstreamLeaseEmission = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getUpstreamLeaseEmissionReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportDownstreamLeaseEmission = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getDownstreamLeaseEmissionReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportWasteGeneratedEmission = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getWasteGeneratedEmissionReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportFlightTravel = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getFlightTravelReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportOtherTransport = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getOtherTransportReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportHotelStays = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getHotelStayReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportEmployeeCommuting = async (req, res) => {
  try {
    //const { facility, year, month, page, page_size } = req.body;
    const { facility, year, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        //   month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    console.log(">>>>>>>>>>", user_id);
    const reportResult = await getEmployeeCommutingReport(
      user_id,
      facility,
      year,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportHomeOffice = async (req, res) => {
  try {
    //const { facility, year, month, page, page_size } = req.body;
    const { facility, year, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        // month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getHomeOfficeReport(
      user_id,
      facility,
      year,
      // month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportSoldProducts = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    var finalReport = [];
    const reportResult = await getSoldProductReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      for (elem of reportResult) {
        const categoryRes = await getCategoryBySeedId(elem.type);
        const productRes = await getSoldProductbyId(elem.productcategory);
        var tempObj = { ...elem };
        delete tempObj["type"];
        delete tempObj["productcategory"];
        if (productRes[0].item !== undefined && productRes[0].item !== null)
          tempObj.product = productRes[0].item;
        if (categoryRes[0].item !== undefined && categoryRes[0].item !== null)
          tempObj.type_of_fuel = categoryRes[0].item;
        finalReport.push(tempObj);
      }
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: finalReport,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportEndOfLifeTreatment = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    var finalReport = [];
    const reportResult = await getEndOfLifeTreatmentReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      for (elem of reportResult) {
        const categoryRes = await getWasteTypebyId(elem.waste_type);
        var tempObj = { ...elem };
        delete tempObj["waste_type"];
        if (categoryRes[0].type !== undefined && categoryRes[0].type !== null)
          tempObj.type_of_fuel = categoryRes[0].type;
        finalReport.push(tempObj);
      }
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: finalReport,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportProOfSoldProducts = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getProOfSoldGoodsReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportRegfriegrant = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    var finalReport = [];
    const reportResult = await getRefrigerantReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      for (elem of reportResult) {
        const categoryRes = await getReferigerantbyId(elem.sub_id);
        var tempObj = { ...elem };
        delete tempObj["sub_id"];
        if (categoryRes[0].item !== undefined && categoryRes[0].item !== null)
          tempObj.item = categoryRes[0].item;
        finalReport.push(tempObj);
      }
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: finalReport,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportFireExtinguisher = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    var finalReport = [];
    const reportResult = await getFireExtinguisherReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      for (elem of reportResult) {
        const categoryRes = await getFireExtbyId(elem.sub_id);
        var tempObj = { ...elem };
        delete tempObj["sub_id"];
        if (categoryRes[0].item !== undefined && categoryRes[0].item !== null)
          tempObj.item = categoryRes[0].item;
        finalReport.push(tempObj);
      }
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: finalReport,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportRenewableElectricity = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getElecricityReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      reportResult.map((elem) => {
        elem.item = "Renewable Electricity";
      });
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportHeatandSteam = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getHeatandSteamReport(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      reportResult.map((elem) => {
        elem.item = "Heat and Steam";
      });
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportWaterSupplyandTreatment = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportResult = await getWaterSupplyandTreatment(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      reportResult.map((elem) => {
        elem.item = "Water Supply and Treatment";
      });
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportResult,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: reportResult,
      });
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

exports.reportCompanyOwnedVehicles = async (req, res) => {
  try {
    const { facility, year, month, page, page_size } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        page: [Joi.number()],
        page_size: [Joi.number()],
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

    const pageNo = parseInt(page) || 1;
    const pageSize = parseInt(page_size) || 50;

    const offset = (pageNo - 1) * pageSize;
    const user_id = req.user.user_id;
    const reportCOVehicles = [];
    const reportResult = await getCompanyOwnedVehicles(
      user_id,
      facility,
      year,
      month,
      pageSize,
      offset
    );
    if (reportResult.length > 0) {
      //   reportResult.map(elem =>{
      //     elem.item = "Water Supply and Treatment"
      //   });

      for (elem of reportResult) {
        const itemRes = await getVehicle(elem.vehicleTypeID);
        const vehicleData = await getpassengervehicletypesById(
          elem.vehicleTypeID
        );
        elem.vehicleName = vehicleData[0].VehicleType;
        elem.item = itemRes[0].item;
        reportCOVehicles.push(elem);
      }
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: reportCOVehicles,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
      });
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

function getMonths(startMonth, EndMonth) {
  var monthString = [
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
  var startIndex = monthString.indexOf(startMonth);
  var endIndex = monthString.indexOf(EndMonth);
  var newArray = monthString.slice(startIndex, endIndex + 1);
  var newMonthString = newArray.join("','");
  newMonthString = "'" + newMonthString + "'";
  return newMonthString;
}

exports.reportFilterMultipleCategory = async (req, res) => {
  try {
    const {
      facility,
      year,
      month,
      purchase_goods,
      downstream,
      upstream,
      franchise_emission,
      investment_emission,
      stationary_combustion,
      upstreamlease_emission,
      downstreamlease_emission,
      waste_generation,
      flight_travel,
      other_transport,
      hotel_stays,
      employee_commuting,
      home_office,
      sold_products,
      process_sold_products,
      refrigerant,
      heat_steam,
      renewable_electricity,
      water_supply_treatment,
      end_of_life_treatment,
      fire_extinguisher,
    } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        purchase_goods: [Joi.number().required()],
        downstream: [Joi.number().required()],
        upstream: [Joi.number().required()],
        franchise_emission: [Joi.number().required()],
        investment_emission: [Joi.number().required()],
        stationary_combustion: [Joi.number().required()],
        upstreamlease_emission: [Joi.number().required()],
        downstreamlease_emission: [Joi.number().required()],
        waste_generation: [Joi.number().required()],
        flight_travel: [Joi.number().required()],
        other_transport: [Joi.number().required()],
        hotel_stays: [Joi.number().required()],
        employee_commuting: [Joi.number().required()],
        home_office: [Joi.number().required()],
        sold_products: [Joi.number().required()],
        process_sold_products: [Joi.number().required()],
        refrigerant: [Joi.number().required()],
        heat_steam: [Joi.number().required()],
        renewable_electricity: [Joi.number().required()],
        water_supply_treatment: [Joi.number().required()],
        end_of_life_treatment: [Joi.number().required()],
        fire_extinguisher: [Joi.number().required()],
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
    var multiReport = [];

    var purchaseGoods = Number(purchase_goods);
    var downStream = Number(downstream);
    var upStream = Number(upstream);
    var franchiseEmission = Number(franchise_emission);
    var investmentEmission = Number(investment_emission);
    var stationaryCombustion = Number(stationary_combustion);
    var upstreamLeaseEmission = Number(upstreamlease_emission);
    var downstreamLeaseEmission = Number(downstreamlease_emission);
    var wasteGeneration = Number(waste_generation);
    var flightTravel = Number(flight_travel);
    var otherTransport = Number(other_transport);
    var hotelStays = Number(hotel_stays);
    var employeeCommuting = Number(employee_commuting);
    var homeOffice = Number(home_office);
    var soldProducts = Number(sold_products);
    var processSoldProducts = Number(process_sold_products);
    var refrigeRant = Number(refrigerant);
    var heatAndSteam = Number(heat_steam);
    var renewableElectricity = Number(renewable_electricity);
    var waterSupplyTreatment = Number(water_supply_treatment);
    var endOfLifeTreatment = Number(end_of_life_treatment);
    var fireExtinguisher = Number(fire_extinguisher);

    if (purchaseGoods) {
      const reportResult = await getPurchaseGoodsReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (downStream) {
      const reportResult = await getDownStreamVehicleReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (upStream) {
      const reportResult = await getUpStreamVehicleReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (franchiseEmission) {
      const reportResult = await getFranchiseEmissionReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (investmentEmission) {
      const reportResult = await getInvestmentEmissionReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (stationaryCombustion) {
      const reportResult = await getStationaryCombustionReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) {
          const categoryRes = await getCategoryBySeedId(elem.category_id);
          var tempObj = {
            scope: "Scope1",
            data_point: "Stationary Combustion",
            category: categoryRes[0].item,
            emission: elem.emission,
            facility: elem.facility,
            year: elem.year,
            month: elem.month,
          };
          multiReport.push(tempObj);
        }
      }
    }
    if (upstreamLeaseEmission) {
      const reportResult = await getUpstreamLeaseEmissionReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (downstreamLeaseEmission) {
      const reportResult = await getDownstreamLeaseEmissionReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (wasteGeneration) {
      const reportResult = await getWasteGeneratedEmissionReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (flightTravel) {
      const reportResult = await getFlightTravelReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (otherTransport) {
      const reportResult = await getOtherTransportReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (hotelStays) {
      const reportResult = await getHotelStayReportMulti(facility, year, month);
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (employeeCommuting) {
      const reportResult = await getEmployeeCommutingReportMulti(
        facility,
        year
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (homeOffice) {
      const reportResult = await getHomeOfficeReportMulti(facility, year);
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (soldProducts) {
      const reportResult = await getSoldProductReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) {
          const categoryRes = await getCategoryBySeedId(elem.type);
          var tempObj = { ...elem };
          delete tempObj["type"];
          if (categoryRes[0].item !== undefined && categoryRes[0].item !== null)
            tempObj.category = categoryRes[0].item;
          multiReport.push(tempObj);
        }
      }
    }
    if (endOfLifeTreatment) {
      const reportResult = await getEndOfLifeTreatmentReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (processSoldProducts) {
      const reportResult = await getProOfSoldGoodsReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }
    if (refrigeRant) {
      const reportResult = await getRefrigerantReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) {
          const categoryRes = await getReferigerantbyId(elem.sub_id);
          var tempObj = { ...elem };
          delete tempObj["sub_id"];
          if (categoryRes[0].item !== undefined && categoryRes[0].item !== null)
            tempObj.category = categoryRes[0].item;
          multiReport.push(tempObj);
        }
      }
    }
    if (fireExtinguisher) {
      const reportResult = await getFireExtinguisherReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) {
          const categoryRes = await getFireExtbyId(elem.sub_id);
          var tempObj = { ...elem };
          delete tempObj["sub_id"];
          if (categoryRes[0].item !== undefined && categoryRes[0].item !== null)
            tempObj.category = categoryRes[0].item;
          multiReport.push(tempObj);
        }
      }
    }
    if (renewableElectricity) {
      const reportResult = await getElecricityReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        // for(elem of reportResult)
        //     multiReport.push(elem);
        for (elem of reportResult) {
          const categoryRes = await getCategoryBySeedId(elem.category_id);
          var tempObj = { ...elem };
          delete tempObj["category_id"];
          if (categoryRes[0].item !== undefined && categoryRes[0].item !== null)
            tempObj.category = categoryRes[0].item;
          multiReport.push(tempObj);
        }
      }
    }
    if (heatAndSteam) {
      const reportResult = await getHeatandSteamReportMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) {
          const categoryRes = await getCategoryBySeedId(elem.category_id);
          var tempObj = { ...elem };
          delete tempObj["category_id"];
          if (categoryRes[0].item !== undefined && categoryRes[0].item !== null)
            tempObj.category = categoryRes[0].item;
          multiReport.push(tempObj);
        }
      }
    }
    if (waterSupplyTreatment) {
      const reportResult = await getWaterSupplyandTreatmentMulti(
        facility,
        year,
        month
      );
      if (reportResult.length > 0) {
        for (elem of reportResult) multiReport.push(elem);
      }
    }

    if (multiReport.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: multiReport,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: [],
      });
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

exports.reportFilterMultipleCategoryNew = async (req, res) => {
  try {
    const {
      facility,
      start_year,
      start_month,
      end_year,
      end_month,
      purchase_goods,
      downstream,
      upstream,
      franchise_emission,
      investment_emission,
      stationary_combustion,
      upstreamlease_emission,
      downstreamlease_emission,
      waste_generation,
      flight_travel,
      other_transport,
      hotel_stays,
      employee_commuting,
      home_office,
      sold_products,
      process_sold_products,
      refrigerant,
      heat_steam,
      renewable_electricity,
      business_travel,
      water_supply_treatment,
      end_of_life_treatment,
      fire_extinguisher,
      company_owned_vehicles,
    } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        start_year: [Joi.string().empty().required()],
        start_month: [Joi.string().empty().required()],
        end_year: [Joi.string().empty().required()],
        end_month: [Joi.string().empty().required()],
        purchase_goods: [Joi.number().required()],
        downstream: [Joi.number().required()],
        upstream: [Joi.number().required()],
        franchise_emission: [Joi.number().required()],
        investment_emission: [Joi.number().required()],
        stationary_combustion: [Joi.number().required()],
        upstreamlease_emission: [Joi.number().required()],
        downstreamlease_emission: [Joi.number().required()],
        waste_generation: [Joi.number().required()],
        flight_travel: [Joi.number().required()],
        other_transport: [Joi.number().required()],
        hotel_stays: [Joi.number().required()],
        employee_commuting: [Joi.number().required()],
        home_office: [Joi.number().required()],
        sold_products: [Joi.number().required()],
        process_sold_products: [Joi.number().required()],
        refrigerant: [Joi.number().required()],
        heat_steam: [Joi.number().required()],
        renewable_electricity: [Joi.number().required()],
        business_travel: [Joi.number().required()],
        water_supply_treatment: [Joi.number().required()],
        end_of_life_treatment: [Joi.number().required()],
        fire_extinguisher: [Joi.number().required()],
        company_owned_vehicles: [Joi.number().required()],
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

    var multiReport = [];

    var purchaseGoods = Number(purchase_goods);
    var downStream = Number(downstream);
    var upStream = Number(upstream);
    var franchiseEmission = Number(franchise_emission);
    var investmentEmission = Number(investment_emission);
    var stationaryCombustion = Number(stationary_combustion);
    var upstreamLeaseEmission = Number(upstreamlease_emission);
    var downstreamLeaseEmission = Number(downstreamlease_emission);
    var wasteGeneration = Number(waste_generation);
    var flightTravel = Number(flight_travel);
    var otherTransport = Number(other_transport);
    var hotelStays = Number(hotel_stays);
    var employeeCommuting = Number(employee_commuting);
    var homeOffice = Number(home_office);
    var soldProducts = Number(sold_products);
    var processSoldProducts = Number(process_sold_products);
    var refrigeRant = Number(refrigerant);
    var heatAndSteam = Number(heat_steam);
    var renewableElectricity = Number(renewable_electricity);
    var businessTravel = Number(business_travel);
    var waterSupplyTreatment = Number(water_supply_treatment);
    var endOfLifeTreatment = Number(end_of_life_treatment);
    var fireExtinguisher = Number(fire_extinguisher);
    var companyOwnedVehicles = Number(company_owned_vehicles);

    var differenceInYear = Number(end_year) - Number(start_year);

    if (purchaseGoods) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getPurchaseGoodsReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getPurchaseGoodsReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (companyOwnedVehicles) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getConpanyOwnedVehiclesMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getConpanyOwnedVehiclesMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (downStream) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getDownStreamVehicleReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getDownStreamVehicleReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (upStream) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getUpStreamVehicleReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getUpStreamVehicleReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (franchiseEmission) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getFranchiseEmissionReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getFranchiseEmissionReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (investmentEmission) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getInvestmentEmissionReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getInvestmentEmissionReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (stationaryCombustion) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getStationaryCombustionReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getStationaryCombustionReportMultiNew(
            facility,
            year,
            months
          );

          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (upstreamLeaseEmission) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getUpstreamLeaseEmissionReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getUpstreamLeaseEmissionReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (downstreamLeaseEmission) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getDownstreamLeaseEmissionReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getDownstreamLeaseEmissionReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (wasteGeneration) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getWasteGeneratedEmissionReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getWasteGeneratedEmissionReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (flightTravel) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getFlightTravelReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getFlightTravelReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (otherTransport) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getOtherTransportReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getOtherTransportReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (hotelStays) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getHotelStayReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getHotelStayReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }

    //Yearly Reports Starts
    if (employeeCommuting) {
      const reportResult = await getEmployeeCommutingReportMultiNew(
        facility,
        start_year
      );
      if (reportResult.length > 0) {
        multiReport.push(...reportResult);
      }
    }
    if (homeOffice) {
      const reportResult = await getHomeOfficeReportMultiNew(
        facility,
        start_year,
        end_year
      );
      if (reportResult.length > 0) {
        multiReport.push(...reportResult);
      }
    }
    //Yearly Reports Ends

    if (soldProducts) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getSoldProductReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getSoldProductReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (endOfLifeTreatment) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getEndOfLifeTreatmentReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getEndOfLifeTreatmentReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (businessTravel) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getFlightTravelReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getFlightTravelReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getHotelStayReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getHotelStayReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getOtherTransportReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getOtherTransportReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (processSoldProducts) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getProOfSoldGoodsReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getProOfSoldGoodsReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (refrigeRant) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getRefrigerantReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getRefrigerantReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (fireExtinguisher) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getFireExtinguisherReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getFireExtinguisherReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (renewableElectricity) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getElecricityReportMultiNew(
          facility,
          start_year,
          months
        );


        if (reportResult.length > 0) {
          reportResult.forEach(element => {
            if (element.DataPoint1 == 1) {
              element.DataPoint1 = 'Renewable Energy Cert (REC)'

            } else if (element.DataPoint1 == 2) {
              element.DataPoint1 = 'Supplier Specific'
            } else {
              element.DataPoint1 = ''
            }
          });
          // for(elem of reportResult)
          //     multiReport.push(elem);
          multiReport.push(...reportResult);
        }
        console.log(multiReport);
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getElecricityReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            reportResult.forEach(element => {
              if (element.DataPoint1 == 1) {
                element.DataPoint1 = 'Renewable Energy Cert (REC)'

              } else if (element.DataPoint1 == 2) {
                element.DataPoint1 = 'Supplier Specific'
              } else {
                element.DataPoint1 = ''
              }
            });
            // for(elem of reportResult)
            //     multiReport.push(elem);

            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (heatAndSteam) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getHeatandSteamReportMultiNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getHeatandSteamReportMultiNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (waterSupplyTreatment) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getWaterSupplyNew(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
        const reportResult1 = await getWaterTreatmentNew(
          facility,
          start_year,
          months
        );
        if (reportResult1.length > 0) {
          multiReport.push(...reportResult1);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getWaterSupplyNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
          const reportResult1 = await getWaterTreatmentNew(
            facility,
            year,
            months
          );
          if (reportResult1.length > 0) {
            multiReport.push(...reportResult1);
          }
        }
      }
    }
    if (multiReport.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: multiReport,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: [],
      });
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

exports.reportFilterMultipleCategoryConsolidated = async (req, res) => {
  try {
    const {
      facility,
      start_year,
      start_month,
      end_year,
      end_month,
      purchase_goods,
      downstream,
      upstream,
      franchise_emission,
      investment_emission,
      stationary_combustion,
      upstreamlease_emission,
      downstreamlease_emission,
      waste_generation,
      flight_travel,
      other_transport,
      hotel_stays,
      employee_commuting,
      home_office,
      sold_products,
      process_sold_products,
      refrigerant,
      heat_steam,
      renewable_electricity,
      end_of_life_treatment,
      fire_extinguisher,
      business_travel,
      water_supply_treatment,
      company_owned_vehicles,
    } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        start_year: [Joi.string().empty().required()],
        start_month: [Joi.string().empty().required()],
        end_year: [Joi.string().empty().required()],
        end_month: [Joi.string().empty().required()],
        purchase_goods: [Joi.number().required()],
        downstream: [Joi.number().required()],
        upstream: [Joi.number().required()],
        franchise_emission: [Joi.number().required()],
        investment_emission: [Joi.number().required()],
        stationary_combustion: [Joi.number().required()],
        upstreamlease_emission: [Joi.number().required()],
        downstreamlease_emission: [Joi.number().required()],
        waste_generation: [Joi.number().required()],
        flight_travel: [Joi.number().required()],
        other_transport: [Joi.number().required()],
        hotel_stays: [Joi.number().required()],
        employee_commuting: [Joi.number().required()],
        home_office: [Joi.number().required()],
        sold_products: [Joi.number().required()],
        process_sold_products: [Joi.number().required()],
        refrigerant: [Joi.number().required()],
        heat_steam: [Joi.number().required()],
        renewable_electricity: [Joi.number().required()],
        water_supply_treatment: [Joi.number().required()],
        end_of_life_treatment: [Joi.number().required()],
        fire_extinguisher: [Joi.number().required()],
        business_travel: [Joi.number().required()],
        company_owned_vehicles: [Joi.number().required()],
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
    var multiReport = [];

    var purchaseGoods = Number(purchase_goods);
    var downStream = Number(downstream);
    var upStream = Number(upstream);
    var franchiseEmission = Number(franchise_emission);
    var investmentEmission = Number(investment_emission);
    var stationaryCombustion = Number(stationary_combustion);
    var upstreamLeaseEmission = Number(upstreamlease_emission);
    var downstreamLeaseEmission = Number(downstreamlease_emission);
    var wasteGeneration = Number(waste_generation);
    var flightTravel = Number(flight_travel);
    var otherTransport = Number(other_transport);
    var hotelStays = Number(hotel_stays);
    var employeeCommuting = Number(employee_commuting);
    var homeOffice = Number(home_office);
    var soldProducts = Number(sold_products);
    var processSoldProducts = Number(process_sold_products);
    var refrigeRant = Number(refrigerant);
    var heatAndSteam = Number(heat_steam);
    var renewableElectricity = Number(renewable_electricity);
    var businessTravel = Number(business_travel);
    var waterSupplyTreatment = Number(water_supply_treatment);
    var endOfLifeTreatment = Number(end_of_life_treatment);
    var fireExtinguisher = Number(fire_extinguisher);
    var companyOwnedVehicles = Number(company_owned_vehicles);
    var differenceInYear = Number(end_year) - Number(start_year);

    if (purchaseGoods) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getPurchaseGoodsReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getPurchaseGoodsReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (companyOwnedVehicles) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getConpanyOwnedVehiclesMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getConpanyOwnedVehiclesMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (downStream) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getDownStreamVehicleReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getDownStreamVehicleReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (upStream) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getUpStreamVehicleReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getUpStreamVehicleReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (franchiseEmission) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getFranchiseEmissionReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getFranchiseEmissionReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (investmentEmission) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getInvestmentEmissionReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getInvestmentEmissionReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (stationaryCombustion) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getStationaryCombustionReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getStationaryCombustionReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (upstreamLeaseEmission) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getUpstreamLeaseEmissionReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getUpstreamLeaseEmissionReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (downstreamLeaseEmission) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getDownstreamLeaseEmissionReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult =
            await getDownstreamLeaseEmissionReportMultiConsole(
              facility,
              year,
              months
            );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (wasteGeneration) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getWasteGeneratedEmissionReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult =
            await getWasteGeneratedEmissionReportMultiConsole(
              facility,
              year,
              months
            );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (flightTravel) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getFlightTravelReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getFlightTravelReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (otherTransport) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getOtherTransportReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getOtherTransportReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (hotelStays) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getHotelStayReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getHotelStayReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (businessTravel) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getFlightTravelReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getFlightTravelReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getHotelStayReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getHotelStayReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getOtherTransportReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getOtherTransportReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (waterSupplyTreatment) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getWaterSupplyConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
        const reportResult1 = await getWaterTreatmentConsole(
          facility,
          start_year,
          months
        );
        if (reportResult1.length > 0) {
          multiReport.push(...reportResult1);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getWaterSupplyConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
          const reportResult1 = await getWaterTreatmentConsole(
            facility,
            year,
            months
          );
          if (reportResult1.length > 0) {
            multiReport.push(...reportResult1);
          }
        }
      }
    }
    //Yearly Reports Starts
    if (employeeCommuting) {
      const reportResult = await getEmployeeCommutingReportMultiConsole(
        facility,
        start_year,
        end_year
      );
      if (reportResult.length > 0) {
        multiReport.push(...reportResult);
      }
    }
    if (homeOffice) {
      const reportResult = await getHomeOfficeReportMultiConsole(
        facility,
        start_year,
        end_year
      );
      if (reportResult.length > 0) {
        multiReport.push(...reportResult);
      }
    }
    //Yearly Reports Ends

    if (soldProducts) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getSoldProductReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getSoldProductReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (endOfLifeTreatment) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getEndOfLifeTreatmentReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getEndOfLifeTreatmentReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (processSoldProducts) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getProOfSoldGoodsReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getProOfSoldGoodsReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (refrigeRant) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getRefrigerantReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getRefrigerantReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (fireExtinguisher) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getFireExtinguisherReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getFireExtinguisherReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (renewableElectricity) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getElecricityReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          // for(elem of reportResult)
          //     multiReport.push(elem);
          reportResult.forEach((element) => {
            if (element.DataPoint1 == 1) {
              element.DataPoint1 = "Renewable Energy Cert (REC)";
            } else if (element.DataPoint1 == 2) {
              element.DataPoint1 = "Supplier Specific";
            } else {
              element.DataPoint1 = "";
            }
          });
          multiReport.push(...reportResult);
        }
        const reportResultL = await getElecricityLocationReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResultL.length > 0) {
          // for(elem of reportResult)
          //     multiReport.push(elem);
          reportResultL.forEach((element) => {
            delete element.region;
            if (element.DataPoint1 == 1) {
              element.DataPoint1 = "Renewable Energy Cert (REC)";
            } else if (element.DataPoint1 == 2) {
              element.DataPoint1 = "Supplier Specific";
            } else {
              element.DataPoint1 = "";
            }
          });
          multiReport.push(...reportResultL);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getElecricityReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            // for(elem of reportResult)
            //     multiReport.push(elem);
            reportResult.forEach((element) => {
              if (element.DataPoint1 == 1) {
                element.DataPoint1 = "Renewable Energy Cert (REC)";
              } else if (element.DataPoint1 == 2) {
                element.DataPoint1 = "Supplier Specific";
              } else {
                element.DataPoint1 = "";
              }
            });
            multiReport.push(...reportResult);
          }
          const reportResultL = await getElecricityLocationReportMultiConsole(
            facility,
            start_year,
            months
          );
          if (reportResultL.length > 0) {
            // for(elem of reportResult)
            //     multiReport.push(elem);
            reportResultL.forEach((element) => {
              delete element.region;
              if (element.DataPoint1 == 1) {
                element.DataPoint1 = "Renewable Energy Cert (REC)";
              } else if (element.DataPoint1 == 2) {
                element.DataPoint1 = "Supplier Specific";
              } else {
                element.DataPoint1 = "";
              }
            });
            multiReport.push(...reportResultL);
          }
        }
      }
    }
    if (heatAndSteam) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getHeatandSteamReportMultiConsole(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getHeatandSteamReportMultiConsole(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }

    if (multiReport.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: multiReport,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: [],
      });
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

exports.reportFilterMultipleCategoryAudit = async (req, res) => {
  try {
    const {
      facility,
      start_year,
      start_month,
      end_year,
      end_month,
      purchase_goods,
      downstream,
      upstream,
      franchise_emission,
      investment_emission,
      stationary_combustion,
      upstreamlease_emission,
      downstreamlease_emission,
      waste_generation,
      business_travel,
      flight_travel,
      other_transport,
      hotel_stays,
      employee_commuting,
      home_office,
      sold_products,
      process_sold_products,
      refrigerant,
      heat_steam,
      renewable_electricity,
      water_supply_treatment,
      end_of_life_treatment,
      fire_extinguisher,
      company_owned_vehicles,
    } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        start_year: [Joi.string().empty().required()],
        start_month: [Joi.string().empty().required()],
        end_year: [Joi.string().empty().required()],
        end_month: [Joi.string().empty().required()],
        purchase_goods: [Joi.number().required()],
        downstream: [Joi.number().required()],
        upstream: [Joi.number().required()],
        franchise_emission: [Joi.number().required()],
        investment_emission: [Joi.number().required()],
        stationary_combustion: [Joi.number().required()],
        upstreamlease_emission: [Joi.number().required()],
        downstreamlease_emission: [Joi.number().required()],
        waste_generation: [Joi.number().required()],
        business_travel: [Joi.number().required()],
        flight_travel: [Joi.number().required()],
        other_transport: [Joi.number().required()],
        hotel_stays: [Joi.number().required()],
        employee_commuting: [Joi.number().required()],
        home_office: [Joi.number().required()],
        sold_products: [Joi.number().required()],
        process_sold_products: [Joi.number().required()],
        refrigerant: [Joi.number().required()],
        heat_steam: [Joi.number().required()],
        renewable_electricity: [Joi.number().required()],
        water_supply_treatment: [Joi.number().required()],
        end_of_life_treatment: [Joi.number().required()],
        fire_extinguisher: [Joi.number().required()],
        company_owned_vehicles: [Joi.number().required()],
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
    var multiReport = [];

    var purchaseGoods = Number(purchase_goods);
    var downStream = Number(downstream);
    var upStream = Number(upstream);
    var franchiseEmission = Number(franchise_emission);
    var investmentEmission = Number(investment_emission);
    var stationaryCombustion = Number(stationary_combustion);
    var upstreamLeaseEmission = Number(upstreamlease_emission);
    var downstreamLeaseEmission = Number(downstreamlease_emission);
    var wasteGeneration = Number(waste_generation);
    var businessTravel = Number(business_travel);
    var flightTravel = Number(flight_travel);
    var otherTransport = Number(other_transport);
    var hotelStays = Number(hotel_stays);
    var employeeCommuting = Number(employee_commuting);
    var homeOffice = Number(home_office);
    var soldProducts = Number(sold_products);
    var processSoldProducts = Number(process_sold_products);
    var refrigeRant = Number(refrigerant);
    var heatAndSteam = Number(heat_steam);
    var renewableElectricity = Number(renewable_electricity);
    var endOfLifeTreatment = Number(end_of_life_treatment);
    var fireExtinguisher = Number(fire_extinguisher);
    var companyOwnedVehicles = Number(company_owned_vehicles);
    var differenceInYear = Number(end_year) - Number(start_year);
    var waterSupplyTreatment = Number(water_supply_treatment);

    if (purchaseGoods) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getPurchaseGoodsReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) {
            if (elem?.unit?.includes("litre")) {
              delete elem["EFkgC02e_ccy"];
              delete elem["EFkgC02e_tonnes"];
              elem["emission_factor"];
              elem["emission_factor_name"];
              delete elem["EFkgC02e_litres"];
            }
            else if (elem?.unit?.includes("tonne")) {
              delete elem["EFkgC02e_ccy"];
              delete elem["EFkgC02e_litres"];
              elem["emission_factor"];
              elem["emission_factor_name"];
              delete elem["EFkgC02e_tonnes"];
            }
            else {
              delete elem["EFkgC02e_tonnes"];
              delete elem["EFkgC02e_litres"];
              elem["emission_factor"];
              elem["emission_factor_name"];
              delete elem["EFkgC02e_ccy"];
            }
            multiReport.push(elem);

          }
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getPurchaseGoodsReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) {
              if (elem?.unit?.includes("litre")) {
                delete elem["EFkgC02e_ccy"];
                delete elem["EFkgC02e_tonnes"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["EFkgC02e_litres"];
              }
              else if (elem?.unit?.includes("tonne")) {
                delete elem["EFkgC02e_ccy"];
                delete elem["EFkgC02e_litres"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["EFkgC02e_tonnes"];
              }
              else {
                delete elem["EFkgC02e_tonnes"];
                delete elem["EFkgC02e_litres"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["EFkgC02e_ccy"];
              }
              multiReport.push(elem);
            }
          }
        }
      }
    }
    if (companyOwnedVehicles) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getCompanyOwnedVehiclesMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) {
            if (elem?.unit?.includes("litre")) {
              delete elem["kgCO2e_km"];
              delete elem["kgCO2e_kg"];
              elem["emission_factor"];
              elem["emission_factor_name"];
              delete elem["kgCO2e_litre"];
            }
            else if (elem?.unit?.includes("kg")) {
              delete elem["kgCO2e_km"];
              delete elem["kgCO2e_litre"];
              elem["emission_factor"];
              elem["emission_factor_name"];
              delete elem["kgCO2e_kg"];
            }
            else {
              delete elem["kgCO2e_kg"];
              delete elem["kgCO2e_litre"];
              elem["emission_factor"];
              elem["emission_factor_name"];
              delete elem["kgCO2e_km"];
            }

            multiReport.push(elem);
          }
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getConpanyOwnedVehiclesMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) {
              if (elem?.unit?.includes("litre")) {
                delete elem["kgCO2e_km"];
                delete elem["kgCO2e_kg"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["kgCO2e_litre"];
              }
              else if (elem?.unit?.includes("_kg")) {
                delete elem["kgCO2e_km"];
                delete elem["kgCO2e_litre"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["kgCO2e_kg"];
              }
              else {
                delete elem["kgCO2e_kg"];
                delete elem["kgCO2e_litre"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["kgCO2e_km"];
              }
              multiReport.push(elem);
            }

          }
        }
      }
    }
    if (downStream) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getDownStreamVehicleReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) {
            const ef1 = elem.emisison_factor1;
            const ef2 = elem.emission_factor2;
            const efn1 = elem.emission_factor_name1;
            const efn2 = elem.emission_factor_name2;

            // Combine emission factors
            if (ef1 != null && ef2 != null) {
              elem.emission_factor = `${ef1},${ef2}`;
            } else if (ef1 != null) {
              elem.emission_factor = ef1;
            } else if (ef2 != null) {
              elem.emission_factor = ef2;
            } else {
              elem.emission_factor = '';
            }

            // Combine emission factor names
            if (efn1 != null && efn2 != null) {
              elem.emission_factor_name = `${efn1},${efn2}`;
            } else if (efn1 != null) {
              elem.emission_factor_name = efn1;
            } else if (efn2 != null) {
              elem.emission_factor_name = efn2;
            } else {
              elem.emission_factor_name = '';
            }
            multiReport.push(elem);
          }
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getDownStreamVehicleReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) {
              const ef1 = elem.emisison_factor1;
              const ef2 = elem.emission_factor2;
              const efn1 = elem.emission_factor_name1;
              const efn2 = elem.emission_factor_name2;

              // Combine emission factors
              if (ef1 != null && ef2 != null) {
                elem.emission_factor = `${ef1},${ef2}`;
              } else if (ef1 != null) {
                elem.emission_factor = ef1;
              } else if (ef2 != null) {
                elem.emission_factor = ef2;
              } else {
                elem.emission_factor = '';
              }

              // Combine emission factor names
              if (efn1 != null && efn2 != null) {
                elem.emission_factor_name = `${efn1},${efn2}`;
              } else if (efn1 != null) {
                elem.emission_factor_name = efn1;
              } else if (efn2 != null) {
                elem.emission_factor_name = efn2;
              } else {
                elem.emission_factor_name = '';
              }
              multiReport.push(elem);
            }
          }
        }
      }
    }
    if (upStream) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getUpStreamVehicleReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) {
            const ef1 = elem.emisison_factor1;
            const ef2 = elem.emission_factor2;
            const efn1 = elem.emission_factor_name1;
            const efn2 = elem.emission_factor_name2;

            // Combine emission factors
            if (ef1 != null && ef2 != null) {
              elem.emission_factor = `${ef1},${ef2}`;
            } else if (ef1 != null) {
              elem.emission_factor = ef1;
            } else if (ef2 != null) {
              elem.emission_factor = ef2;
            } else {
              elem.emission_factor = '';
            }

            // Combine emission factor names
            if (efn1 != null && efn2 != null) {
              elem.emission_factor_name = `${efn1},${efn2}`;
            } else if (efn1 != null) {
              elem.emission_factor_name = efn1;
            } else if (efn2 != null) {
              elem.emission_factor_name = efn2;
            } else {
              elem.emission_factor_name = '';
            }

            multiReport.push(elem);
          }
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getUpStreamVehicleReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) {
              const ef1 = elem.emisison_factor1;
              const ef2 = elem.emission_factor2;
              const efn1 = elem.emission_factor_name1;
              const efn2 = elem.emission_factor_name2;

              // Combine emission factors
              if (ef1 != null && ef2 != null) {
                elem.emission_factor = `${ef1},${ef2}`;
              } else if (ef1 != null) {
                elem.emission_factor = ef1;
              } else if (ef2 != null) {
                elem.emission_factor = ef2;
              } else {
                elem.emission_factor = '';
              }

              // Combine emission factor names
              if (efn1 != null && efn2 != null) {
                elem.emission_factor_name = `${efn1},${efn2}`;
              } else if (efn1 != null) {
                elem.emission_factor_name = efn1;
              } else if (efn2 != null) {
                elem.emission_factor_name = efn2;
              } else {
                elem.emission_factor_name = '';
              }

              multiReport.push(elem);
            }
          }
        }
      }
    }
    if (franchiseEmission) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getFranchiseEmissionReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getFranchiseEmissionReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (investmentEmission) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getInvestmentEmissionReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getInvestmentEmissionReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (stationaryCombustion) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getStationaryCombustionReportMultiAudit(
          facility,
          start_year,
          months
        );

        if (reportResult.length > 0) {
          for (elem of reportResult) {
            if (elem?.unit?.includes("KL")) {
              delete elem["kgCO2e_kwh"];
              delete elem["kgCO2e_tonnes"];
              delete elem["kgCO2e_kg"];
              elem["emission_factor"] = elem["emission_factor_used"];
              elem["emission_factor_name"] = "kgCO2e/" + elem["emission_factor_unit"];
              delete elem["kgCO2e_litre"];
            }
            else if (elem?.unit?.includes("kwh")) {
              delete elem["kgCO2e_litre"];
              delete elem["kgCO2e_tonnes"];
              delete elem["kgCO2e_kg"];
              elem["emission_factor"] = elem["emission_factor_used"];
              elem["emission_factor_name"] = "kgCO2e/" + elem["emission_factor_unit"];
              delete elem["kgCO2e_kwh"];
            }
            else if (elem?.unit?.includes("kg")) {
              delete elem["kgCO2e_kwh"];
              delete elem["kgCO2e_litre"];
              delete elem["kgCO2e_tonnes"];
              elem["emission_factor"] = elem["emission_factor_used"];
              elem["emission_factor_name"] = "kgCO2e/" + elem["emission_factor_unit"];
              delete elem["kgCO2e_kg"];

            }
            else {
              delete elem["kgCO2e_kwh"];
              delete elem["kgCO2e_litre"];
              delete elem["kgCO2e_kg"];
              elem["emission_factor"] = elem["emission_factor_used"];
              elem["emission_factor_name"] = "kgCO2e/" + elem["emission_factor_unit"];
              delete elem["kgCO2e_tonnes"];
            }
            multiReport.push(elem);
          }
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getStationaryCombustionReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) {
              if (elem?.unit?.includes("KL")) {
                delete elem["kgCO2e_kwh"];
                delete elem["kgCO2e_tonnes"];
                delete elem["kgCO2e_kg"];
                elem["emission_factor"] = elem["emission_factor_used"];
                elem["emission_factor_name"] = "kgCO2e/" + elem["emission_factor_unit"];
                delete elem["kgCO2e_litre"];
              }
              else if (elem?.unit?.includes("kwh")) {
                delete elem["kgCO2e_litre"];
                delete elem["kgCO2e_tonnes"];
                delete elem["kgCO2e_kg"];
                elem["emission_factor"] = elem["emission_factor_used"];
                elem["emission_factor_name"] = "kgCO2e/" + elem["emission_factor_unit"];
                delete elem["kgCO2e_kwh"];
              }
              else if (elem?.unit?.includes("kg")) {
                delete elem["kgCO2e_kwh"];
                delete elem["kgCO2e_litre"];
                delete elem["kgCO2e_tonnes"];
                elem["emission_factor"] = elem["emission_factor_used"];
                elem["emission_factor_name"] = "kgCO2e/" + elem["emission_factor_unit"];
                delete elem["kgCO2e_kg"];

              }
              else {
                delete elem["kgCO2e_kwh"];
                delete elem["kgCO2e_litre"];
                delete elem["kgCO2e_kg"];
                elem["emission_factor"] = elem["emission_factor_used"];
                elem["emission_factor_name"] = "kgCO2e/" + elem["emission_factor_unit"];
                delete elem["kgCO2e_tonnes"];
              }
              multiReport.push(elem);
            }
          }
        }
      }
    }
    if (upstreamLeaseEmission) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getUpstreamLeaseEmissionReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) {
            const ef1 = elem.emission_factor1;
            const ef2 = elem.emission_factor2;
            const efn1 = elem.emission_factor_name1;
            const efn2 = elem.emission_factor_name2;

            // Combine emission factors
            if (ef1 != null && ef2 != null) {
              elem.emission_factor = `${ef1},${ef2}`;
            } else if (ef1 != null) {
              elem.emission_factor = ef1;
            } else if (ef2 != null) {
              elem.emission_factor = ef2;
            } else {
              elem.emission_factor = '';
            }

            // Combine emission factor names
            if (efn1 != null && efn2 != null) {
              elem.emission_factor_name = `${efn1},${efn2}`;
            } else if (efn1 != null) {
              elem.emission_factor_name = efn1;
            } else if (efn2 != null) {
              elem.emission_factor_name = efn2;
            } else {
              elem.emission_factor_name = '';
            }
            multiReport.push(elem);
          }
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getUpstreamLeaseEmissionReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) {
              const ef1 = elem.emisison_factor1;
              const ef2 = elem.emission_factor2;
              const efn1 = elem.emission_factor_name1;
              const efn2 = elem.emission_factor_name2;

              // Combine emission factors
              if (ef1 != null && ef2 != null) {
                elem.emission_factor = `${ef1},${ef2}`;
              } else if (ef1 != null) {
                elem.emission_factor = ef1;
              } else if (ef2 != null) {
                elem.emission_factor = ef2;
              } else {
                elem.emission_factor = '';
              }

              // Combine emission factor names
              if (efn1 != null && efn2 != null) {
                elem.emission_factor_name = `${efn1},${efn2}`;
              } else if (efn1 != null) {
                elem.emission_factor_name = efn1;
              } else if (efn2 != null) {
                elem.emission_factor_name = efn2;
              } else {
                elem.emission_factor_name = '';
              }
              multiReport.push(elem);
            }
          }
        }
      }
    }
    if (downstreamLeaseEmission) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getDownstreamLeaseEmissionReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getDownstreamLeaseEmissionReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (wasteGeneration) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getWasteGeneratedEmissionReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) {
            if (elem?.unit?.includes("litre")) {
              delete elem["kg"];
              delete elem["tonnes"];
              elem["emission_factor"];
              elem["emission_factor_name"];
              delete elem["litres"];
            }
            else if (elem?.unit?.includes("tonnes")) {
              delete elem["litres"];
              delete elem["kg"];
              elem["emission_factor"];
              elem["emission_factor_name"];
              delete elem["tonnes"];
            }
            else {
              delete elem["tonnes"];
              delete elem["litres"];
              elem["emission_factor"];
              elem["emission_factor_name"];
              delete elem["kg"];
            }
            multiReport.push(elem);
          }
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getWasteGeneratedEmissionReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) {
              if (elem?.unit?.includes("litre")) {
                delete elem["kg"];
                delete elem["tonnes"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["litres"];
              }
              else if (elem?.unit?.includes("tonnes")) {
                delete elem["litres"];
                delete elem["kg"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["tonnes"];
              }
              else {
                delete elem["tonnes"];
                delete elem["litres"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["kg"];
              }
              multiReport.push(elem);
            }
          }
        }
      }
    }
    if (businessTravel) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getFlightTravelReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getFlightTravelReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }

      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getHotelStayReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getHotelStayReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }

      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getOtherTransportReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getOtherTransportReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (flightTravel) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getFlightTravelReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getFlightTravelReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (otherTransport) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getOtherTransportReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getOtherTransportReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }
    if (hotelStays) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getHotelStayReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) multiReport.push(elem);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getHotelStayReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) multiReport.push(elem);
          }
        }
      }
    }

    //Yearly Reports Starts
    if (employeeCommuting) {
      const reportResult = await getEmployeeCommutingReportMultiAudit(
        facility,
        start_year,
        end_year
      );
      if (reportResult.length > 0) {
        multiReport.push(...reportResult);
      }
    }
    if (homeOffice) {
      const reportResult = await getHomeOfficeReportMultiAudit(
        facility,
        start_year,
        end_year
      );

      if (reportResult.length > 0) {
        const enrichedResult = reportResult.filter(item => item.category != null && item.Years != null && item.Months != null).map(item => ({
          ...item,
          scope: 'Scope3',
          DataPoint1: 'Home Office'
        }));
        multiReport.push(...enrichedResult);
      }
    }
    if (soldProducts) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getSoldProductReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getSoldProductReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (endOfLifeTreatment) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getEndOfLifeTreatmentReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) {
            if (elem?.unit?.includes("litre")) {
              delete elem["kg"];
              delete elem["tonnes"];
              elem["emission_factor"];
              elem["emission_factor_name"];
              delete elem["litres"];
            }
            else if (elem?.unit?.includes("tonnes")) {
              delete elem["litres"];
              delete elem["kg"];
              elem["emission_factor"];
              elem["emission_factor_name"];
              delete elem["tonnes"];
            }
            else {
              delete elem["tonnes"];
              delete elem["litres"];
              elem["emission_factor"];
              elem["emission_factor_name"];
              delete elem["kg"];
            }
            multiReport.push(elem);
          }
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getEndOfLifeTreatmentReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) {
              if (elem?.unit?.includes("litre")) {
                delete elem["kg"];
                delete elem["tonnes"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["litres"];
              }
              else if (elem?.unit?.includes("tonnes")) {
                delete elem["litres"];
                delete elem["kg"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["tonnes"];
              }
              else {
                delete elem["tonnes"];
                delete elem["litres"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["kg"];
              }
              multiReport.push(elem);
            }
          }
        }
      }
    }
    if (processSoldProducts) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getProOfSoldGoodsReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          for (elem of reportResult) {
            if (elem?.unit?.includes("litre")) {
              delete elem["efkgco2_tonnes"];
              delete elem["efkgco2_kg"];
              elem["emission_factor"]
              elem["emission_factor_name"]
              delete elem["efkgco2_litres"];
            }
            else if (elem?.unit?.includes("tonne")) {
              delete elem["efkgco2_litres"];
              delete elem["efkgco2_kg"];
              elem["emission_factor"]
              elem["emission_factor_name"]
              delete elem["efkgco2_tonnes"];
            }
            else {
              delete elem["efkgco2_tonnes"];
              delete elem["efkgco2_litres"];
              elem["emission_factor"]
              elem["emission_factor_name"]
              delete elem["efkgco2_kg"];
            }
            multiReport.push(elem);
          }
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getProOfSoldGoodsReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            for (elem of reportResult) {
              if (elem?.unit?.includes("litre")) {
                delete elem["efkgco2_tonnes"];
                delete elem["efkgco2_kg"];
                elem["emission_factor"]
                elem["emission_factor_name"]
                delete elem["efkgco2_litres"];
              }
              else if (elem?.unit?.includes("tonne")) {
                delete elem["efkgco2_litres"];
                delete elem["efkgco2_kg"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["efkgco2_tonnes"];
              }
              else {
                delete elem["efkgco2_tonnes"];
                delete elem["efkgco2_litres"];
                elem["emission_factor"];
                elem["emission_factor_name"];
                delete elem["efkgco2_kg"];
              }
              multiReport.push(elem);
            }
          }
        }
      }
    }
    if (refrigeRant) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getRefrigerantReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getRefrigerantReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (fireExtinguisher) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getFireExtinguisherReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getFireExtinguisherReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (renewableElectricity) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getElecricityReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          reportResult.forEach(element => {
            if (element.DataPoint1 == 1) {
              element.DataPoint1 = 'Renewable Energy Cert (REC)'

            } else if (element.DataPoint1 == 2) {
              element.DataPoint1 = 'Supplier Specific'
            } else {
              element.DataPoint1 = ''
            }
          });
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getElecricityReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            reportResult.forEach(element => {
              if (element.DataPoint1 == 1) {
                element.DataPoint1 = 'Renewable Energy Cert (REC)'

              } else if (element.DataPoint1 == 2) {
                element.DataPoint1 = 'Supplier Specific'
              } else {
                element.DataPoint1 = ''
              }
            });

            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (heatAndSteam) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getHeatandSteamReportMultiAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getHeatandSteamReportMultiAudit(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
        }
      }
    }
    if (waterSupplyTreatment) {
      if (differenceInYear == 0) {
        var months = getMonths(start_month, end_month);
        const reportResult = await getWaterSupplyAudit(
          facility,
          start_year,
          months
        );
        if (reportResult.length > 0) {
          multiReport.push(...reportResult);
        }
        const reportResult1 = await getWaterTreatmentAudit(
          facility,
          start_year,
          months
        );
        if (reportResult1.length > 0) {
          multiReport.push(...reportResult1);
        }
      } else {
        for (var year = Number(start_year); year <= Number(end_year); year++) {
          var months = "";
          if (year === Number(start_year)) {
            months = getMonths(start_month, "Dec");
          } else if (year === Number(end_year)) {
            months = getMonths("Jan", end_month);
          } else {
            months = getMonths("Jan", "Dec");
          }
          const reportResult = await getWaterSupplyNew(
            facility,
            year,
            months
          );
          if (reportResult.length > 0) {
            multiReport.push(...reportResult);
          }
          const reportResult1 = await getWaterTreatmentNew(
            facility,
            year,
            months
          );
          if (reportResult1.length > 0) {
            multiReport.push(...reportResult1);
          }
        }
      }
    }
    if (multiReport.length > 0) {
      return res.json({
        success: true,
        status: 200,
        message: "The report fetched succesfully",
        result: multiReport,
      });
    } else {
      return res.json({
        success: false,
        status: 400,
        message: "No Data Found",
        result: [],
      });
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

exports.waterReport = async (req, res) => {
  try {
    const { facility, start_year, start_month, end_year, end_month } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        start_year: [Joi.string().empty().required()],
        start_month: [Joi.string().empty().required()],
        end_year: [Joi.string().empty().required()],
        end_month: [Joi.string().empty().required()],
      })
    );

    var differenceInYear = Number(end_year) - Number(start_year);
    var waterWithdrawal = [];
    var waterDischarge = [];
    var waterDischargeOnly = [];

    if (differenceInYear == 0) {
      var months = getMonths(start_month, end_month);
      waterWithdrawal = await getWaterWithdrawal(facility, start_year, months);
      waterDischarge = await getWaterDischarge(facility, start_year, months);
      waterDischargeOnly = await getWaterDischargeOnly(
        facility,
        start_year,
        months
      );
    } else {
      for (var year = Number(start_year); year <= Number(end_year); year++) {
        var months = "";
        if (year === Number(start_year)) {
          months = getMonths(start_month, "Dec");
        } else if (year === Number(end_year)) {
          months = getMonths("Jan", end_month);
        } else {
          months = getMonths("Jan", "Dec");
        }
        waterWithdrawal = await getWaterWithdrawal(facility, year, months);
        waterDischarge = await getWaterDischarge(facility, year, months);
        waterDischargeOnly = await getWaterDischargeOnly(
          facility,
          year,
          months
        );
      }
    }
    return res.json({
      success: true,
      message: "Water Report Created",
      waterWithdrawal: waterWithdrawal,
      waterDischarge: waterDischarge,
      waterDischargeOnly: waterDischargeOnly,
      status: 200,
    });
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

exports.waterReportConsolidated = async (req, res) => {
  try {
    const { facility, start_year, start_month, end_year, end_month } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.string().empty().required()],
        start_year: [Joi.string().empty().required()],
        start_month: [Joi.string().empty().required()],
        end_year: [Joi.string().empty().required()],
        end_month: [Joi.string().empty().required()],
      })
    );

    var differenceInYear = Number(end_year) - Number(start_year);
    var waterWithdrawal = [];
    var waterDischarge = [];
    var waterDischargeOnly = [];

    if (differenceInYear == 0) {
      var months = getMonths(start_month, end_month);
      waterWithdrawal = await getWaterWithdrawalConsole(
        facility,
        start_year,
        months
      );
      waterDischarge = await getWaterDischargeConsole(
        facility,
        start_year,
        months
      );
      waterDischargeOnly = await getWaterDischargeOnlyConsole(
        facility,
        start_year,
        months
      );
    } else {
      for (var year = Number(start_year); year <= Number(end_year); year++) {
        var months = "";
        if (year === Number(start_year)) {
          months = getMonths(start_month, "Dec");
        } else if (year === Number(end_year)) {
          months = getMonths("Jan", end_month);
        } else {
          months = getMonths("Jan", "Dec");
        }
        waterWithdrawal = await getWaterWithdrawalConsole(
          facility,
          year,
          months
        );
        waterDischarge = await getWaterDischargeConsole(facility, year, months);
        waterDischargeOnly = await getWaterDischargeOnlyConsole(
          facility,
          year,
          months
        );
      }
    }
    return res.json({
      success: true,
      message: "Water Report Created",
      waterWithdrawal: waterWithdrawal,
      waterDischarge: waterDischarge,
      waterDischargeOnly: waterDischargeOnly,
      status: 200,
    });
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

exports.vendorReport = async (req, res) => {
  try {
    const { vendors, is_multi_consolidated } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        vendors: [Joi.string().empty().required()],
        is_multi_consolidated: Joi.string()
          .min(1)
          .max(1)
          .empty()
          .required()
          .messages({
            "string.empty": "can't be empty!!",
            "string.min": "minimum 1 value required",
            "string.max": "maximum 1 values allowed",
          }),
      })
    );

    if (is_multi_consolidated == "M") {
      const vendorReport = await getVendorsReportMulti(vendors);
      return res.json({
        success: true,
        message: "Water Report Created",
        vendorReport: vendorReport,
        status: 200,
      });
    } else {
      const vendorReport = await getVendorsReportConsole(vendors);
      return res.json({
        success: true,
        message: "Water Report Created",
        vendorReport: vendorReport,
        status: 200,
      });
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

exports.vendorDashboardReport = async (req, res) => {
  try {
    const { tenant_id, facility, year } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        tenant_id: [Joi.number().empty().required()],
        facility: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
      })
    );

    var vendorCount = 0;
    var vendorEmission = 0;
    var vendorWiseEmission = [];

    const vendorCountRes = await getVendorsCount(facility);
    if (vendorCountRes.length > 0) {
      vendorCount = vendorCountRes[0].count;
    }

    const vendorEmissionRes = await getVendorsEmission(facility, year);
    if (vendorEmissionRes.length > 0) {
      vendorEmission = vendorEmissionRes[0].total_emission;
    }

    var expense = vendorEmission * 40;
    var emiToExpRatio = vendorCount / expense;

    const vendorWiseEmissionRes = await getVendorWiseEmission(facility, year);
    if (vendorWiseEmissionRes.length > 0) {
      for (elem of vendorWiseEmissionRes) {
        var expenseV = elem.perVenderEmission * 40;
        elem.perVendoremiToExpRatio = Number(1 / expenseV);
        vendorWiseEmission.push(elem);
      }
    }

    return res.json({
      success: true,
      message: "Vendor Report Created",
      vendorCount: vendorCount,
      vendorEmission: vendorEmission,
      expense: expense,
      emiToExpRatio: emiToExpRatio,
      vendorWiseEmission: vendorWiseEmission,
      status: 200,
    });
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

exports.getEmisionByLocation = async (req, res) => {
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
    }

    const getDetails = await getEmissionByLoc(facilities, year);
    var renewable = [];
    var series = [];
    var totalEmssion = 0;
    for (ele of getDetails) {
      renewable.push(Number(ele.emission));
      series.push(ele.name);
      totalEmssion += Number(ele.emission);
    }
    if (getDetails.length > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Succesfully fetched data",
        renewable: renewable,
        series: series,
        totalEmssion: totalEmssion,
      });
    } else {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "No Data Found",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

const handleServerError = (res, error) => {
  return res.status(500).json({
    success: false,
    message: "An internal server error occurred. Please try again later.",
    status: 500,
    error: error.message,
  });
};

exports.getVendorProductDashboard = async (req, res) => {
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
    }

    var totalEmissions = 0;
    var emissions = await getProductGraphVendors(facilities, year);
    if (emissions.length > 0) {
      emissions.some((elem) => {
        totalEmissions += Number(elem.emission);
      });

      totalEmissions = totalEmissions.toFixed(2);

      emissions.some((elem) => {
        elem.percentage = (Number(elem.emission) / totalEmissions) * 100;
        elem.percentage = elem.percentage.toFixed(2);
      });

      return res.json({
        success: true,
        message: "Succesfully fetched Graph Details",
        emissions: emissions,
        totalEmissions: totalEmissions,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "No Data Found",
        status: 400,
      });
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
