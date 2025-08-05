const Joi = require("joi");
const moment = require("moment");
const config = require("../config");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { fetchDetailsByFamilyID, insertFamily, insertFamily_new, fetchDetails, insertMemberDetails, insertMemberRelations, insertMemberDetails_new, insertMemberRelations_new,
  fetchRelationbyIdFamilyId, fetchMemberDetailsById, fetchfacilitiesdetail, fetchMemberDetailsByfamily_id, fetchDetailsnewchild_id, fetchdetails_new, addGroup, fetchgroupdetail, addGroupmapping,
  fetchDetailtenant_id, fetchDetailsbyId, fetchDetailsnewchild, fetchMemberDetails_new, fetchMemberDetailsById_new, fetchRelationbyIdFamilyId_new, addFacilities, fetchDetailsbydefault, fetchgroupdetailForFacilites, addGroupForCreateTree,fetchMainGroupId } = require("../models/tree")
const { getSelectedColumn, updateData, deleteData } = require("../models/common");
const baseurl = config.base_url;
const bcrypt = require('bcryptjs');
const { charLength } = require("random-hash/dist/baseN");

exports.allTreedata = async (req, res) => {
  try {
    const { family_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        family_id: [Joi.number().required().empty()],
      })
    );
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

    const familyTreeDetails = [];
    const familyDetails = await fetchDetailsByFamilyID(family_id);
    if (familyDetails.length !== 0) {
      for (let detail of familyDetails) {
        var tempDetails = {
          id: detail.id,
          name: detail.name,
          family_id: detail.family_id,
        };
        const relationDetails = await fetchRelationbyIdFamilyId(
          detail.id,
          family_id
        );
        if (relationDetails.length > 0) {
          if (Number(relationDetails[0].partner_id) !== 0) {
            tempDetails.pids = [relationDetails[0].partner_id];
          }
          if (Number(relationDetails[0].father_id) !== 0) {
            tempDetails.fid = relationDetails[0].father_id;
          }
          if (Number(relationDetails[0].mother_id) !== 0) {
            tempDetails.mid = relationDetails[0].mother_id;
          }
          tempDetails.relation = detail.main_name

          tempDetails.facility_name = detail.facility_name
          tempDetails.level_at_tree = detail.level_at_tree

        } else {
          if (Number(detail.level_at_tree) !== 1) {
            return res.json({
              message:
                "No Details are found about the family relations in the database",
              status: 502,
              success: false,
            });
          }
        }
        familyTreeDetails.push(tempDetails);
      }

      return res.json({
        status: 200,
        message: "Tree loaded successfully",
        success: true,
        familyTreeDetails: familyTreeDetails,
      });
    } else {
      return res.json({
        message: "No Details are found about the family",
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

exports.allTreedata_new = async (req, res) => {
  try {
    const { family_id, tenant_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        family_id: [Joi.number().required().empty()],
        tenant_id: [Joi.number().required().empty()],
      })
    );
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

    // const authHeader = req.headers.auth;
    // const jwtToken = authHeader.replace("Bearer ", "");
    // const decoded = jwt.decode(jwtToken);
    // const tenant_id = decoded.user_id;

    const familyTreeDetails = [];
    const familyDetails = await fetchMemberDetails_new(family_id, tenant_id);
    if (familyDetails.length !== 0) {
      for (let detail of familyDetails) {
        var tempDetails = {
          id: detail.id,
          name: detail.name,
          family_id: detail.family_id,
        };
        const relationDetails = await fetchRelationbyIdFamilyId_new(
          detail.id,
          family_id,
          tenant_id
        );
        if (relationDetails.length > 0) {
          if (Number(relationDetails[0].partner_id) !== 0) {
            tempDetails.pids = [relationDetails[0].partner_id];
          }
          if (Number(relationDetails[0].father_id) !== 0) {
            tempDetails.fid = relationDetails[0].father_id;
          }
          if (Number(relationDetails[0].mother_id) !== 0) {
            tempDetails.mid = relationDetails[0].mother_id;
          }
          tempDetails.relation = detail.main_name

          tempDetails.facility_name = detail.facility_name
          tempDetails.level_at_tree = detail.level_at_tree

        } else {
          if (Number(detail.level_at_tree) !== 1) {
            return res.json({
              message:
                "No Details are found about the family relations in the database",
              status: 502,
              success: false,
            });
          }
        }
        familyTreeDetails.push(tempDetails);
      }
     
      return res.json({
        status: 200,
        message: "Tree loaded successfully",
        success: true,
        familyTreeDetails: familyTreeDetails,
      });
    } else {
      return res.json({
        message: "No Details are found about the family",
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

exports.addMainTree = async (req, res) => {
  try {
    const { tenant_id, family_name, main_name } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        tenant_id: [Joi.number().required().empty()],
        // total_members: [Joi.number().optional().allow('').allow(null)],
        family_name: [Joi.string().required().empty()],
        main_name: [Joi.string().required().empty()],
        //  name: [Joi.string().required().empty()],
      })
    );
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

    const user_id = req.user.user_id;

    const familyDetails = {
      user_id: user_id,
      tenant_id: tenant_id,
      name: family_name,
      total_members: 10
    }
    var insertDetails = await insertFamily(familyDetails);
    if (insertDetails.affectedRows > 0) {

      const rootData = {
        family_id: insertDetails.insertId,
        level_at_tree: 1,
        main_name: main_name,
        name: family_name,
        has_child: "N",
      };
      const resultSet = await insertMemberDetails(rootData);
      if (resultSet.affectedRows > 0) {
        const relData = {
          id: resultSet.insertId,
          family_id: insertDetails.insertId,
          mother_id: 0,
          father_id: 0,
          partner_id: 0,
          level: 1,
          relation_with_id: 0,
          relation_withname: "Main",
          relation_name: "Head"
        }
        const resultInsRel = await insertMemberRelations(relData);
      }

      return res.json({
        success: true,
        message: "Family added Successfully",
        status: 200,
        insertDetails: insertDetails
      })
    }
    else {
      res.json({
        success: false,
        status: 400,
        message: "Database Error while inserting family",
      });
    }
  } catch (error) {
    console.log(error)
    res.json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.addRoot = async (req, res) => {
  try {
    const { family_id, main_name, name } = req.body;
    let filename = "";
    const schema = Joi.alternatives(
      Joi.object({
        family_id: [Joi.number().required().empty()],
        main_name: [Joi.string().required().empty()],
        name: [Joi.string().required().empty()],

      })
    );
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

    const rootData = {
      family_id: family_id,
      level_at_tree: 1,
      main_name: main_name,
      name: name,
      has_child: "N",
    };
    const resultSet = await insertMemberDetails(rootData);
    if (resultSet.affectedRows > 0) {
      const relData = {
        id: resultSet.insertId,
        family_id: family_id,
        mother_id: 0,
        father_id: 0,
        partner_id: 0,
        level: 1,
        relation_with_id: 0,
        relation_withname: "Main",
        relation_name: "Head"
      }
      const resultInsRel = await insertMemberRelations(relData);
      if (resultInsRel.affectedRows > 0) {
        res.json({
          success: true,
          status: 200,
          message: "Root created successfully",
          insertDetails: resultSet,
        });
      }
      else {
        res.json({
          status: 400,
          success: false,
          message: "Problem Inserting Relation at root node",
        });
      }
    } else {
      res.json({
        success: false,
        status: 402,
        message: "Database error occured while inserting the root node",
      });
    }
  } catch (error) {
    console.log(error)
    res.json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

async function addChild(id, family_id, childDetails, relation) {
  var father_id = 0;
  var mother_id = 0;
  var memberWithName;
  try {
    const relationWithMemDetail = await fetchMemberDetailsById(id, family_id);
    if (relationWithMemDetail.length > 0) {
      memberWithName = relationWithMemDetail[0].main_name;
      const relationWithDetails = await fetchRelationbyIdFamilyId(
        id,
        family_id
      );
      if (relationWithDetails.length > 0) {
        childDetails.has_child = "N";
        childDetails.level_at_tree = relationWithDetails[0].level + 1;

        childDetails.marital_status = "S";

        father_id = relationWithDetails[0].id;
        mother_id = relationWithDetails[0].partner_id;

        new_child = relationWithDetails[0].new_child ? relationWithDetails[0].new_child : 0;
        tenant_id = relationWithDetails[0].tenant_id ? relationWithDetails[0].tenant_id : 0;
        // } else if (relationWithMemDetail[0].gender === "female") {
        //   mother_id = relationWithDetails[0].id;
        //   father_id = relationWithDetails[0].partner_id;
        // }
        const resultSet = await insertMemberDetails(childDetails);
        if (resultSet.affectedRows > 0) {
          const chilcRelationData = {
            id: resultSet.insertId,
            partner_id: 0,
            father_id: father_id,
            mother_id: mother_id,
            level: childDetails.level_at_tree,
            relation_with_id: id,
            relation_withname: memberWithName,
            relation_name: relation,
            family_id: family_id,
            new_child: new_child ? new_child : 0,
            tenant_id: tenant_id ? tenant_id : 0
          };
          const resultSetRel = await insertMemberRelations(chilcRelationData);
          if (resultSetRel.affectedRows > 0) {
            return resultSetRel.affectedRows;
          } else {
            throw new Error("Database error while inserting");
          }
        }
      } else {
        throw new Error(
          "Database error while fetching relations of refrence id"
        );
      }
    } else {
      throw new Error("Member with which you want to add Child does not exist");
    }
  } catch (error) {
    console.error("The member is not :", error);
    throw error; // You might want to handle or log the error appropriately
  }
}

async function addChilddummy2(id, family_id, childDetails, relation) {
  var father_id = 0;
  var mother_id = 0;
  var memberWithName;
  try {
    const relationWithMemDetail = await fetchMemberDetailsById_new(id, family_id);
    if (relationWithMemDetail.length > 0) {
      memberWithName = relationWithMemDetail[0].main_name;
      const relationWithDetails = await fetchRelationbyIdFamilyId_new(
        id,
        family_id,
        childDetails.tenant_id
      );
      if (relationWithDetails.length > 0) {
        childDetails.has_child = "N";
        childDetails.level_at_tree = relationWithDetails[0].level + 1;

        childDetails.marital_status = "S";

        father_id = relationWithDetails[0].id;
        mother_id = relationWithDetails[0].partner_id;

        new_child = relationWithDetails[0].new_child ? relationWithDetails[0].new_child : 0;
        tenant_id = relationWithDetails[0].tenant_id ? relationWithDetails[0].tenant_id : 0;
        // } else if (relationWithMemDetail[0].gender === "female") {
        //   mother_id = relationWithDetails[0].id;
        //   father_id = relationWithDetails[0].partner_id;
        // }
        console.log("childDetails",childDetails);
        const resultSet = await insertMemberDetails_new(childDetails);
        if (resultSet.affectedRows > 0) {
          const chilcRelationData = {
            id: resultSet.insertId,
            partner_id: 0,
            father_id: father_id,
            mother_id: mother_id,
            level: childDetails.level_at_tree,
            relation_with_id: id,
            relation_withname: memberWithName,
            relation_name: relation,
            family_id: family_id,
            new_child: new_child ? new_child : 0,
            tenant_id: tenant_id ? tenant_id : 0
          };
          const resultSetRel = await insertMemberRelations_new(chilcRelationData);
          if (resultSetRel.affectedRows > 0) {
            return resultSet.insertId;
          } else {
            throw new Error("Database error while inserting");
          }
        }
      } else {
        throw new Error(
          "Database error while fetching relations of refrence id"
        );
      }
    } else {
      throw new Error("Member with which you want to add Child does not exist");
    }
  } catch (error) {
    console.error("The member is not :", error);
    throw error; // You might want to handle or log the error appropriately
  }
}

exports.addChildInTree = async (req, res) => {
  try {
    const { id, family_id, main_name, name, facility_name, new_child, old_id } =
      req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().required().empty()],
        family_id: [Joi.number().required().empty()],
        main_name: [Joi.string().required().empty()],
        name: [Joi.string().required().empty()],
        facility_name: [Joi.optional().allow("")],
        new_child: [Joi.optional().allow("")],
        old_id: [Joi.optional().allow("")]
      })
    );

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

    const tenant_id = req.user.user_id;

    if (new_child == 1 && old_id == 0) {
     

      const membersfetchMemberDetails_new = await fetchMemberDetails_new(family_id, tenant_id);

      if (membersfetchMemberDetails_new.length > 0) {

        const newchild = await fetchDetailsnewchild_id(family_id, id);

        const memberData = {
          family_id: family_id,
          level_at_tree: 0,
          has_child: "",
          marital_status: "",
          main_name: main_name,
          name: name ? name : "",
          facility_name: facility_name ? facility_name : "",
          new_child: 1,
          tenant_id: tenant_id
        };
        console.log("memberData", memberData);
        responseReturned = await addChilddummy2(newchild[0]?.id, family_id, memberData, "Son");

        const datafetch = await fetchdetails_new(tenant_id, family_id);
        if (datafetch.length > 0) {
          if (main_name == 'Sub Group') {
            const datafetxch = await fetchgroupdetail(newchild[0]?.id)
            let detail = {
              groupname: name,
              groupBy: 'Facility',
              TenantID: tenant_id,
              is_subgroup: 1,
              member_id: responseReturned ? responseReturned : 0,
              member_group_id: datafetch[0]?.maingroup_id ? datafetch[0]?.maingroup_id : 0,
              is_main_group: 0
            }
            let supgroup = await addGroup(detail);
            sub_group_id = supgroup.insertId
          }

          if (main_name == 'Facility') {
            const datafetxch = await fetchgroupdetail(newchild[0]?.id);
            const getMainGroupId = await fetchMainGroupId(tenant_id);
            let detail = {
              AssestName: name ? name : name,
              AssestType: facility_name ? facility_name : "",
              CountryId: '101',
              TenantID: tenant_id,
              member_id: responseReturned ? responseReturned : 0,
              sub_group_id: datafetxch[0]?.id ? datafetxch[0]?.id : 0,
              is_main_group: 0
            }
            const facilitiesid = await addFacilities(detail);
            let facilityId = facilitiesid.insertId

            if (newchild[0]?.id) {
              if (datafetxch.length > 0) {
                let detail = {
                  groupId: getMainGroupId[0]?.id ? getMainGroupId[0]?.id : 0,
                  CountryId: 101,
                  facilityId: facilityId,
                  sub_group_id: datafetxch[0]?.id ? datafetxch[0]?.id : 0,
                  tenant_id: tenant_id,
                }
                const Groupmap = await addGroupmapping(detail);
              }
            }
          }
        }
      }

      return res.json({
        status: 200,
        message: "Node Added Successfully",
        success: true,
      });

    } else if (new_child == 1 && old_id == 1) {

      let where = `where family_id  = '${family_id}' and tenant_id = '${tenant_id}'`;
      const updateDetails = await deleteData('`member_details_new`', where)
      let where1 = ` where family_id  = '${family_id}' and tenant_id = '${tenant_id}'`;
      const updateDetails1 = await deleteData('`members_relation_new`', where1)

      let responseReturned = "";
      const members = await fetchDetailsByFamilyID(family_id);
      await Promise.all(
        members.map(async (item) => {
          const memberData = {
            family_id: family_id,
            main_name: item.main_name,
            level_at_tree: item.level_at_tree,
            name: item.name,
            facility_name: item.facility_name,
            has_child: "N",
            new_child: item.id,
            tenant_id: tenant_id
          };
          let responseReturned = await insertMemberDetails_new(memberData);
        }));

      const members1 = await fetchMemberDetails_new(family_id, tenant_id);

      await Promise.all(members1?.map(async (item) => {
        const memberrelation = await fetchRelationbyIdFamilyId(item.new_relation_id, family_id);
        let fid = "";
        if (memberrelation[0].father_id != 0) {
          let newchilds = await fetchDetailsnewchild(family_id, memberrelation[0]?.father_id, tenant_id);
          fid = newchilds[0]?.id;
        } else {
          fid = 0;
        }


        const relData = {
          id: item.id,
          family_id: item.family_id,
          mother_id: 0,
          father_id: fid ? fid : 0,
          partner_id: 0,
          level: item.level_at_tree,
          relation_with_id: fid ? fid : 0,
          relation_withname: item.main_name,
          relation_name: memberrelation[0]?.relation_name ? memberrelation[0]?.relation_name : "",
          new_child: 1,
          tenant_id: tenant_id
        }
        const resultInsRel = await insertMemberRelations_new(relData);
      }));

      const newchild = await fetchDetailsnewchild(family_id, id, tenant_id);

      const memberData = {
        family_id: family_id,
        level_at_tree: 0,
        has_child: "",
        marital_status: "",
        main_name: main_name,
        name: name ? name : "",
        facility_name: facility_name ? facility_name : "",
        new_child: 1,
        tenant_id: tenant_id
      };
      responseReturned = await addChilddummy2(newchild[0].id, family_id, memberData, "Son");


      return res.json({
        status: 200,
        message: "Node Added Successfully",
        success: true,
      });


    } else if (new_child == 0 && old_id == 0) {
      const memberData = {
        family_id: family_id,
        level_at_tree: 0,
        has_child: "",
        marital_status: "",
        main_name: main_name,
        name: name ? name : "",
        facility_name: facility_name ? facility_name : "",
        new_child: new_child ? new_child : 0,
        tenant_id: tenant_id

      };
      const responseReturned = await addChild(id, family_id, memberData, "Son");
      return res.json({
        status: 200,
        message: "Node Added Successfully",
        success: true,
        familyTreeDetails: []
      });
    }

  } catch (error) {
    console.log("Error thrown by the flow ==>", error);
    res.json({
      success: false,
      status: 500,
      error: error,
      message: "Internal Server Error",
    });
  }
};

exports.deleteNode = async (req, res) => {
  try {
    const { family_id, id, new_child, old_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        family_id: [Joi.number().required().empty()],
        id: [Joi.number().required().empty()],
        new_child: [Joi.optional().allow("")],
        old_id: [Joi.optional().allow("")]
      })
    );
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

    const tenant_id = req.user.user_id;

    let updateDetails = "";

    if (new_child == 1 && old_id == 0) {

      const membersfetchMemberDetails_new = await fetchMemberDetails_new(family_id, tenant_id);

      if (membersfetchMemberDetails_new.length > 0) {

        let where12 = `where family_id  = '${family_id}' and id = '${id}' and tenant_id = '${tenant_id}'`;
        updateDetails = await deleteData('`member_details_new`', where12)


        let where1 = ` where family_id  = '${family_id}' and id = '${id}' and tenant_id = '${tenant_id}'`;
        let updateDetails1 = await deleteData('`members_relation_new`', where1)
      }

      const datafetch = await fetchdetails_new(tenant_id, family_id);
      if (datafetch.length > 0) {

        const datafetxch = await fetchgroupdetail(id)
        if (datafetxch.length > 0) {

          let where2 = ` where sub_group_id  = '${datafetxch[0].id}' and tenant_id =  '${tenant_id}'`;
          let updateDetail1 = await deleteData('`dbo.groupmapping`', where2)

          let where1 = ` where member_id  = '${id}' and tenantID='${tenant_id}' `;
          let updateDetails12 = await deleteData('`dbo.group`', where1)

          let where3 = ` where sub_group_id  = '${datafetxch[0].id}' and TenantID = '${tenant_id}' `;
          let updateDetail3 = await deleteData('`dbo.facilities`', where3)

        }

        const datafetch2 = await fetchfacilitiesdetail(id);
        if (datafetch2.length > 0) {

          let whereq = ` where facilityId  = '${datafetch2[0].ID}' and tenant_id =  '${tenant_id}'`;
          let updateDetail = await deleteData('`dbo.groupmapping`', whereq)


          let where2 = ` where member_id  = '${id}' and TenantID = '${tenant_id}' `;
          let updateDetail1 = await deleteData('`dbo.facilities`', where2)

        }

      }



    } else if (new_child == 1 && old_id == 1) {

      let where2 = `where family_id  = '${family_id}' and tenant_id = '${tenant_id}'`;
      let updateDetails111 = await deleteData('`member_details_new`', where2)
      let where1 = ` where family_id  = '${family_id}' and tenant_id = '${tenant_id}'`;
      let updateDetails11 = await deleteData('`members_relation_new`', where1)

      let responseReturned = "";
      const members = await fetchDetailsByFamilyID(family_id);
      await Promise.all(
        members.map(async (item) => {
          const memberData = {
            family_id: family_id,
            main_name: item.main_name,
            level_at_tree: item.level_at_tree,
            name: item.name,
            facility_name: item.facility_name,
            has_child: "N",
            new_child: item.id,
            tenant_id: tenant_id
          };
          let responseReturned = await insertMemberDetails_new(memberData);
        }));

      const members1 = await fetchMemberDetails_new(family_id, tenant_id);

      await Promise.all(members1?.map(async (item) => {
        const memberrelation = await fetchRelationbyIdFamilyId(item.new_relation_id, family_id);
        let fid = "";
        if (memberrelation[0].father_id != 0) {
          let newchilds = await fetchDetailsnewchild(family_id, memberrelation[0]?.father_id, tenant_id);
          fid = newchilds[0]?.id;
        } else {
          fid = 0;
        }


        const relData = {
          id: item.id,
          family_id: item.family_id,
          mother_id: 0,
          father_id: fid ? fid : 0,
          partner_id: 0,
          level: item.level_at_tree,
          relation_with_id: fid,
          relation_withname: item.main_name,
          relation_name: memberrelation[0]?.relation_name ? memberrelation[0]?.relation_name : "",
          new_child: 1,
          tenant_id: tenant_id
        }
        const resultInsRel = await insertMemberRelations_new(relData);
      }));

      const newchild = await fetchDetailsnewchild(family_id, id, tenant_id);

      // console.log(newchild,"newchildnewchild")

      let where12 = `where family_id  = '${family_id}' and id = '${newchild[0]?.id}' and tenant_id = '${tenant_id}'`;
      updateDetails = await deleteData('`member_details_new`', where12)

      let where11 = ` where family_id  = '${family_id}' and  id = '${newchild[0]?.id}' and tenant_id = '${tenant_id}'`;
      let updateDetails1 = await deleteData('`members_relation_new`', where11)

    } else if (new_child == 0 && old_id == 0) {
      let where = `where family_id  = '${family_id}' and id = '${id}'`;
      updateDetails = await deleteData('`member_details`', where)


      let where1 = ` where family_id  = '${family_id}' and id = '${id}'`;
      let updateDetails1 = await deleteData('`members_relation`', where1)

    }

    if (updateDetails.affectedRows > 0) {
      return res.json({
        status: 200,
        message: "Node deleted successfully...",
        success: true,
        updateDetails: updateDetails,
      });
    }
    else {
      return res.json({
        status: 400,
        message: "No details found for the family id in database",
        success: false,
        updateDetails: [],
      });
    }
  } catch (error) {
    console.log(error)
    res.json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }

};

exports.deleteTree = async (req, res) => {
  try {
    const { family_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        family_id: [Joi.number().required().empty()],
      })
    );
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

    let where = `where id  = '${family_id}' `;
    const updateDetails = await deleteData('`family_details`', where)

    let where2 = `where family_id  = '${family_id}' `;
    const updateDetails2 = await deleteData('`member_details`', where2)

    let where1 = ` where family_id  = '${family_id}' `;
    const updateDetails1 = await deleteData('`members_relation`', where1)


    if (updateDetails.affectedRows > 0) {
      return res.json({
        status: 200,
        message: "Tree deleted successfully...",
        success: true,
        updateDetails: updateDetails,
      });
    }
    else {
      return res.json({
        status: 400,
        message: "No details found for the family id in database",
        success: false,
        familyDetails: familyDetails,
      });
    }
  } catch (error) {

    res.json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.getFamilyMembers = async (req, res) => {
  try {
    const { family_id } = req.params;
    const schema = Joi.alternatives(
      Joi.object({
        family_id: [Joi.number().required().empty()],
      })
    );
    const result = schema.validate(req.params);

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

    const familyDetails = await fetchDetailsByFamilyID(family_id);
    if (familyDetails.length > 0) {

      await Promise.all(
        familyDetails.map(async (item) => {
          item.relation = item.main_name
        }));


      return res.json({
        status: 200,
        message: "Tree loaded successfully",
        success: true,
        familyDetails: familyDetails,
      });
    }
    else {
      return res.json({
        status: 400,
        message: "No details found for the family id in database",
        success: false,
        familyDetails: familyDetails,
      });
    }
  } catch (error) {
    res.json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.getAllFamilyMembers = async (req, res) => {
  try {
    const { tenant_id } = req.params;
    const schema = Joi.alternatives(
      Joi.object({
        tenant_id: [Joi.number().required().empty()],
      })
    );
    const result = schema.validate(req.params);

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

    let familyDetails = "";
    let family_id = '';
    familyDetails = await fetchDetails(tenant_id);
    let new_data = 0;

    if (familyDetails.length == 0) {

      const memberdetails = await fetchDetailtenant_id(tenant_id);

      if (memberdetails.length > 0) {

        family_id = memberdetails[0]?.family_id;
        new_data = 1;
      }
      // let where  = `where user_id  = '${tenant_id}' `;
      // const  updateDetails =  await deleteData('`member_updated`', where)

      // let where2 = `where tenant_id  = '${tenant_id}' `;
      // const  updateDetails2 =  await deleteData('`member_details_new`', where2)

      // let where1  = ` where tenant_id  = '${tenant_id}' `;
      // const  updateDetails1 =  await deleteData('`members_relation_new`', where1)

      familyDetails = await fetchDetailsbydefault();
    } else {

      new_data = 1;
      family_id = familyDetails[0]?.id;
    }

    if (familyDetails.length > 0) {
      await Promise.all(
        familyDetails.map(async (item) => {
          item.family_id = item.id
        }));

      return res.json({
        status: 200,
        message: "Tree loaded successfully",
        success: true,
        familyDetails: familyDetails,
        new_data: new_data,
        family_id: family_id

      });
    }
    else {
      return res.json({
        status: 400,
        message: "No details found for the family id in database",
        success: false,
        familyDetails: familyDetails,
      });
    }
  } catch (error) {
    console.log(error)
    res.json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.getNodedeailById = async (req, res) => {
  try {
    const { id, family_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().required().empty()],
        family_id: [Joi.number().required().empty()],
      })
    );
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

    const familyDetails = await fetchMemberDetailsById(id, family_id);
    if (familyDetails.length > 0) {
      await Promise.all(
        familyDetails.map(async (item) => {
          item.relation = item.main_name
        }));

      return res.json({
        status: 200,
        message: "Tree loaded successfully",
        success: true,
        familyDetails: familyDetails,
      });
    }
    else {
      return res.json({
        status: 400,
        message: "No details found for the family id in database",
        success: false,
        familyDetails: familyDetails,
      });
    }
  } catch (error) {
    res.json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.UpdateChildInTree = async (req, res) => {
  try {
    const { update_data, new_child, old_id } =
      req.body;
    const schema = Joi.alternatives(
      Joi.object({
        update_data: [Joi.optional().allow("")],
        new_child: [Joi.optional().allow("")],
        old_id: [Joi.optional().allow("")],
      })
    );
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

    const tenant_id = req.user.user_id;

    let array = [];
    const jsonObject = JSON.parse(update_data);
    let memberdetails = "";
    let family_id = jsonObject.family_id;
    if (new_child == 1 && old_id == 0) {
      const membersfetchMemberDetails_new = await fetchMemberDetails_new(family_id, tenant_id);
      if (membersfetchMemberDetails_new.length > 0) {
        const newchild = await fetchDetailsnewchild_id(family_id, jsonObject.id, tenant_id);
        const currentDateTime = moment();
        const memberData = {
          main_name: jsonObject.main_name,
          name: jsonObject.name,
          facility_name: jsonObject.facility_name ? jsonObject.facility_name : "",
          updated_at: currentDateTime.format("YYYY-MM-DD HH:mm:ss")
        };

        const memberData1 = {
          relation_withname: jsonObject.main_name,
          updated_at: currentDateTime.format("YYYY-MM-DD HH:mm:ss")
        };

        let where = ` where id  = '${newchild[0]?.id}' and  family_id = '${jsonObject.family_id}'`;
        memberdetails = await updateData('member_details_new', where, memberData);
        console.log(memberdetails);
        const memberdetails1 = await updateData('members_relation_new', where, memberData1)
        console.log(memberdetails1);


        const datafetch = await fetchdetails_new(tenant_id, family_id);
        if (datafetch.length > 0) {
          if (jsonObject.main_name == 'Sub Group' || jsonObject.main_name == 'Main Group') {

            let where = ` where member_id  = '${newchild[0]?.id}' `;
            const memberData2 = {
              groupname: jsonObject.name,
            };
            let updetails = await updateData('`dbo.group`', where, memberData2);
            console.log(updetails);

          }

          if (jsonObject.main_name == 'Facility') {

            let where2 = ` where member_id  = '${newchild[0]?.id}' and TenantID =  '${tenant_id}'`;
            const memberData21 = {
              AssestName: jsonObject.name ? jsonObject.name : "",
              AssestType: jsonObject.facility_name ? jsonObject.facility_name : "",
            };
            let updetails = await updateData('`dbo.facilities`', where2, memberData21)
            console.log(updetails);

          }
        }
      }

    } else if (new_child == 1 && old_id == 1) {


      let where2 = `where family_id  = '${family_id}' and tenant_id = '${tenant_id}' `;
      const updateDetails = await deleteData('`member_details_new`', where2)
      let where1 = ` where family_id  = '${family_id}' and tenant_id = '${tenant_id}'`;
      const updateDetails1 = await deleteData('`members_relation_new`', where1)

      let responseReturned = "";
      const members = await fetchDetailsByFamilyID(family_id);
      await Promise.all(
        members.map(async (item) => {
          const memberData = {
            family_id: family_id,
            main_name: item.main_name,
            level_at_tree: item.level_at_tree,
            name: item.name,
            facility_name: item.facility_name,
            has_child: "N",
            new_child: item.id,
            tenant_id: tenant_id
          };
          let responseReturned = await insertMemberDetails_new(memberData);
        }));

      const members1 = await fetchMemberDetails_new(family_id, tenant_id);

      await Promise.all(members1?.map(async (item) => {

        const memberrelation = await fetchRelationbyIdFamilyId(item.new_relation_id, family_id);
        let fid = "";
        if (memberrelation[0].father_id != 0) {

          let newchilds = await fetchDetailsnewchild(family_id, memberrelation[0]?.father_id, tenant_id);
          fid = newchilds[0]?.id;
        } else {
          fid = 0;
        }

        const relData = {
          id: item.id,
          family_id: item.family_id,
          mother_id: 0,
          father_id: fid ? fid : 0,
          partner_id: 0,
          level: item.level_at_tree,
          relation_with_id: fid,
          relation_withname: item.main_name,
          relation_name: memberrelation[0]?.relation_name ? memberrelation[0]?.relation_name : "",
          new_child: 1,
          tenant_id: tenant_id
        }
        const resultInsRel = await insertMemberRelations_new(relData);
      }));


      const newchild = await fetchDetailsnewchild(family_id, jsonObject.id, tenant_id);

      const currentDateTime = moment();
      const memberData = {
        main_name: jsonObject.main_name,
        name: jsonObject.name,
        facility_name: jsonObject.facility_name ? jsonObject.facility_name : "",
        updated_at: currentDateTime.format("YYYY-MM-DD HH:mm:ss")
      };

      const memberData1 = {
        relation_withname: jsonObject.main_name,
        updated_at: currentDateTime.format("YYYY-MM-DD HH:mm:ss")
      };

      let where = ` where id  = '${newchild[0].id}' and  family_id = '${jsonObject.family_id}'`;
      memberdetails = await updateData('member_details_new', where, memberData)
      const memberdetails1 = await updateData('members_relation_new', where, memberData1)
      console.log(memberdetails1)

      // let dataupdated =  {
      //   updated_member:1,
      //   delete_member:0,
      //   added_member:0,
      //   user_id:tenant_id,
      //   family_id:jsonObject.family_id
      // }
      // let insererupdated = await insertMemberupdated(dataupdated)



    } else if (new_child == 0 && old_id == 0) {
      const currentDateTime = moment();
      const memberData = {
        main_name: jsonObject.main_name,
        name: jsonObject.name,
        facility_name: jsonObject.facility_name ? jsonObject.facility_name : "",
        updated_at: currentDateTime.format("YYYY-MM-DD HH:mm:ss")
      };

      const memberData1 = {
        relation_withname: jsonObject.main_name,
        updated_at: currentDateTime.format("YYYY-MM-DD HH:mm:ss")
      };

      let where = ` where id  = '${jsonObject.id}' and  family_id = '${jsonObject.family_id}'`;
      memberdetails = await updateData('member_details', where, memberData)
      const memberdetails1 = await updateData('members_relation', where, memberData1)
      console.log(memberdetails1)

    }


    if (memberdetails.affectedRows) {
      return res.json({
        status: 200,
        message: "Node Updated Successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log("Error thrown by the flow ==>", error);
    res.json({
      success: false,
      status: 500,
      error: error,
      message: "Internal Server Error",
    });
  }
};

/*
exports.createaddMainTree = async (req, res) => {
  try {
    const { family_id, jsonData } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        family_id: [Joi.string().required().empty()],
        jsonData: [Joi.string().required().empty()],
      })
    );
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

    const authHeader = req.headers.auth;
    const jwtToken = authHeader.replace("Bearer ", "");
    const decoded = jwt.decode(jwtToken);
    const tenant_id = decoded.user_id;


    let familyDetails = await fetchDetails(tenant_id);
    if (familyDetails.length > 0) {
      res.json({
        success: false,
        status: 400,
        message: "You have already added Tree",
      });
    }

    const member_details = JSON.parse(jsonData);
    let arraymember = [];
    for(var i=0; i<member_details?.length; i++){

      if (member_details[i].relation == 'Main Group') {
        let detail = {
          groupname: member_details[i].name,
          groupBy: 'Facility',
          TenantID: tenant_id,
          is_subgroup: 0,
          member_id: member_details[i].id ? member_details[i].id : 0,
          member_group_id: 0,
          is_main_group:1
        }
        let resultSet1 = await addGroup(detail);
        let group_id = resultSet1.insertId
      //  console.log(resultSet1.insertId, "resultSet1.insertId")
        arraymember.push(resultSet1.insertId)

      }

      if (member_details[i].relation == 'Sub Group') {
        //console.log("entered")
        let detail1 = {
          groupname: member_details[i].name,
          groupBy: 'Facility',
          TenantID: tenant_id,
          is_subgroup: 1,
          member_id: member_details[i].id ? member_details[i].id : 0,
          member_group_id: arraymember[0] ? arraymember[0] : 0,
          is_main_group:0
        }
   
        let supgroup = await addGroup(detail1);
        let sub_group_id = supgroup.insertId
      }

      if (member_details[i].relation == 'Facility') {

         // console.log(member_details[i].fid); 
        
         const datafetxch = await fetchgroupdetail( [i]?.fid)

        let detail2 = {
          AssestName: member_details[i].name  ? member_details[i].name : "",
          AssestType:member_details[i].facility_name ? member_details[i].facility_name : "",
          CountryId: '101',
          TenantID: tenant_id,
          member_id: member_details[i].id ? member_details[i].id : 0,
          sub_group_id: datafetxch[0]?.id ? datafetxch[0]?.id : 0
        }
        const facilitiesid = await addFacilities(detail2);
        let facilityId = facilitiesid.insertId

        if (member_details[i].fid) {
         
          if (datafetxch.length > 0) {
            let detail3 = {
              groupId: arraymember[0] ? arraymember[0] : 0,
              CountryId: 101,
              facilityId: facilityId,
              sub_group_id: datafetxch[0].id,
              tenant_id: tenant_id,
            }
            const Groupmap = await addGroupmapping(detail3);

          }

        }

      }


    }
 


    const familyDetail = await fetchDetailsbyId(family_id);

    if (familyDetail.length > 0) {
      const familyDetails = {
        id: family_id,
        user_id: tenant_id,
        tenant_id: tenant_id,
        name: familyDetail[0].family_name,
        total_members: 10,
        maingroup_id:arraymember[0] ? arraymember[0]  : 0
      }
      var insertDetails = await insertFamily_new(familyDetails);

      if (insertDetails.affectedRows > 0) {

        const members_detail = await fetchMemberDetailsByfamily_id(family_id,tenant_id)
        console.log(members_detail,"members_detailmembers_detailmembers_detail")

        if(members_detail.length == 0){

          let responseReturned = "";
          const members = await fetchDetailsByFamilyID(family_id);
          if(members.length >0){
            await Promise.all(
              members.map(async (item) => {
                const memberData = {
                  family_id: family_id,
                  main_name: item.main_name,
                  level_at_tree: item.level_at_tree,
                  name: item.name,
                  facility_name: item.facility_name,
                  has_child: "N",
                  new_child: item.id,
                  tenant_id: tenant_id
                };
                let responseReturned = await insertMemberDetails_new(memberData);
                //Aishwarya Holkar Fix Starts 
                if(responseReturned.affectedRows > 1)
                {
                    
                }
              }));
      
            const members1 = await fetchMemberDetails_new(family_id, tenant_id);
      
            await Promise.all(members1?.map(async (item) => {
              const memberrelation = await fetchRelationbyIdFamilyId(item.new_relation_id,family_id);
              let fid = "";
              if(memberrelation[0].father_id != 0){
                  let newchilds = await fetchDetailsnewchild(family_id, memberrelation[0]?.father_id,tenant_id);
                 fid = newchilds[0]?.id;
                }else{
                  fid = 0;
                }
      
                const relData = {
                  id: item.id,
                  family_id: item.family_id,
                  mother_id: 0,
                  father_id: fid ? fid :0 ,
                  partner_id: 0,
                  level: item.level_at_tree,
                  relation_with_id: fid,
                  relation_withname: item.main_name,
                  relation_name:  memberrelation[0]?.relation_name ? memberrelation[0]?.relation_name :"",
                  new_child: 1,
                  tenant_id: tenant_id
                }
                const resultInsRel = await insertMemberRelations_new(relData);
              }));
    
          }
        }
     
        let data = {
          is_saved: 1
        }

        let where = ` where  family_id = '${family_id}' and tenant_id = '${tenant_id}'`;
        const memberdetails = await updateData('member_details_new', where, data)
        const memberdetails1 = await updateData('members_relation_new', where, data)



        return res.json({
          success: true,
          message: "Family added Successfully",
          status: 200,
          insertDetails: insertDetails,
          family_id: family_id
        })

      } else {
        res.json({
          success: false,
          status: 400,
          message: "Database Error while inserting family",
        });
      }
    } else {
      res.json({
        success: false,
        status: 400,
        message: "Family Not Found!",
      });

    }
  } catch (error) {
    console.log(error)
    res.json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
}*/


exports.createaddMainTree = async (req, res) => {
  try {
    const { family_id, jsonData } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        family_id: [Joi.string().required().empty()],
        jsonData: [Joi.string().required().empty()],
      })
    );
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

    const tenant_id = req.user.user_id;

    let familyDetails = await fetchDetails(tenant_id);
    if (familyDetails.length > 0) {
      res.json({
        success: false,
        status: 400,
        message: "You have already added Tree",
      });
    }

    const member_details = JSON.parse(jsonData);
    let arraymember = [];
    const familyDetail = await fetchDetailsbyId(family_id);

    if (familyDetail.length > 0) {
      const familyDetails = {
        id: family_id,
        user_id: tenant_id,
        tenant_id: tenant_id,
        name: familyDetail[0].family_name,
        total_members: 10,
        maingroup_id: arraymember[0] ? arraymember[0] : 0
      }
      var insertDetails = await insertFamily_new(familyDetails);

      if (insertDetails.affectedRows > 0) {

        const members_detail = await fetchMemberDetailsByfamily_id(family_id, tenant_id)
        console.log(members_detail, "members_detailmembers_detailmembers_detail")

        if (members_detail.length == 0) {

          let responseReturned = "";
          // const members = await fetchDetailsByFamilyID(family_id);
          // if(members.length >0){
          //   await Promise.all(
          //     members.map(async (item) => {
          //       const memberData = {
          //         family_id: family_id,
          //         main_name: item.main_name,
          //         level_at_tree: item.level_at_tree,
          //         name: item.name,
          //         facility_name: item.facility_name,
          //         has_child: "N",
          //         new_child: item.id,
          //         tenant_id: tenant_id
          //       };
          //       let responseReturned = await insertMemberDetails_new(memberData);

          //       if(responseReturned.affectedRows > 0)
          //       {
          //          let newMemberDetails =  member_details.filter(elem => elem.id  === item.id)

          //         if (newMemberDetails[0].relation == 'Main Group') {
          //           let detail = {
          //             groupname: newMemberDetails[0].name,
          //             groupBy: 'Facility',
          //             TenantID: tenant_id,
          //             is_subgroup: 0,
          //             member_id: responseReturned.insertId ? responseReturned.insertId : 0,
          //             member_group_id: 0,
          //             is_main_group:1
          //           }
          //           let resultSet1 = await addGroup(detail);
          //           console.log(" main gorup done",resultSet1);
          //           let group_id = resultSet1.insertId

          //           arraymember.push(resultSet1.insertId)

          //         }

          //         if (newMemberDetails[0].relation == 'Sub Group') {

          //           let detail1 = {
          //             groupname: newMemberDetails[0].name,
          //             groupBy: 'Facility',
          //             TenantID: tenant_id,
          //             is_subgroup: 1,
          //             member_id: responseReturned.insertId ? responseReturned.insertId : 0,
          //             member_group_id: arraymember[0] ? arraymember[0] : 0,
          //             is_main_group:0
          //           }

          //           let supgroup = await addGroup(detail1);
          //           console.log("supgroup entry done",supgroup );
          //           let sub_group_id = supgroup.insertId
          //         }

          //         if (newMemberDetails[0].relation == 'Facility') {



          //            const datafetxch = await fetchgroupdetail( newMemberDetails[0].fid)

          //           let detail2 = {
          //             AssestName: newMemberDetails[0].name  ? newMemberDetails[0].name : "",
          //             AssestType:newMemberDetails[0].facility_name ? newMemberDetails[0].facility_name : "",
          //             CountryId: '101',
          //             TenantID: tenant_id,
          //             member_id: responseReturned.insertId ? responseReturned.insertId : 0,
          //             sub_group_id: datafetxch[0]?.id ? datafetxch[0]?.id : 0
          //           }
          //           const facilitiesid = await addFacilities(detail2);
          //           let facilityId = facilitiesid.insertId

          //           if (newMemberDetails[0].fid) {

          //             if (datafetxch.length > 0) {
          //               let detail3 = {
          //                 groupId: arraymember[0] ? arraymember[0] : 0,
          //                 CountryId: 101,
          //                 facilityId: facilityId,
          //                 sub_group_id: datafetxch[0].id,
          //                 tenant_id: tenant_id,
          //               }
          //               const Groupmap = await addGroupmapping(detail3);

          //             }

          //           }

          //         }

          //       }
          //     }));

          // faraz khan fix starts
          const members = await fetchDetailsByFamilyID(family_id);

          if (members.length > 0) {
            for (const item of members) {
              const memberData = {
                family_id: family_id,
                main_name: item.main_name,
                level_at_tree: item.level_at_tree,
                name: item.name,
                facility_name: item.facility_name,
                has_child: "N",
                new_child: item.id,
                tenant_id: tenant_id,
              };

              const responseReturned = await insertMemberDetails_new(memberData);

              // Aishwarya Holkar Fix Starts
              if (responseReturned.affectedRows > 0) {
                const newMemberDetails = member_details.filter((elem) => elem.id === item.id);

                if (newMemberDetails[0]?.relation === "Main Group") {
                  const detail = {
                    groupname: newMemberDetails[0].name,
                    groupBy: "Facility",
                    TenantID: tenant_id,
                    is_subgroup: 0,
                    member_id: responseReturned.insertId || 0,
                    member_group_id: 0,
                    is_main_group: 1,
                  };
                  const resultSet1 = await addGroup(detail);
                  console.log("Main group done", resultSet1);
                  arraymember.push(resultSet1.insertId);
                }

                if (newMemberDetails[0]?.relation === "Sub Group") {
                  const detail1 = {
                    groupname: newMemberDetails[0].name,
                    groupBy: "Facility",
                    TenantID: tenant_id,
                    is_subgroup: 1,
                    member_id: responseReturned.insertId || 0,
                    member_group_id: arraymember[0] || 0,
                    is_main_group: 0,
                    subGroup_templateID: newMemberDetails[0]?.id
                  };
                  const supgroup = await addGroupForCreateTree(detail1);
                  console.log("Subgroup entry done", supgroup);
                }

                if (newMemberDetails[0]?.relation === "Facility") {
                  const datafetxch = await fetchgroupdetailForFacilites(newMemberDetails[0]?.fid, tenant_id);

                  const detail2 = {
                    AssestName: newMemberDetails[0]?.name || "",
                    AssestType: newMemberDetails[0]?.facility_name || "",
                    CountryId: "101",
                    TenantID: tenant_id,
                    member_id: responseReturned.insertId || 0,
                    sub_group_id: datafetxch[0]?.id || 0,
                  };
                  const facilitiesid = await addFacilities(detail2);

                  if (newMemberDetails[0]?.fid && datafetxch.length > 0) {
                    const detail3 = {
                      groupId: arraymember[0] || 0,
                      CountryId: 101,
                      facilityId: facilitiesid.insertId,
                      sub_group_id: datafetxch[0]?.id,
                      tenant_id: tenant_id,
                    };
                    await addGroupmapping(detail3);
                  }
                }
              }
            }
          }


          const members1 = await fetchMemberDetails_new(family_id, tenant_id);

          await Promise.all(members1?.map(async (item) => {
            const memberrelation = await fetchRelationbyIdFamilyId(item.new_relation_id, family_id);
            let fid = "";
            if (memberrelation[0].father_id != 0) {
              let newchilds = await fetchDetailsnewchild(family_id, memberrelation[0]?.father_id, tenant_id);
              fid = newchilds[0]?.id;
            } else {
              fid = 0;
            }

            const relData = {
              id: item.id,
              family_id: item.family_id,
              mother_id: 0,
              father_id: fid ? fid : 0,
              partner_id: 0,
              level: item.level_at_tree,
              relation_with_id: fid,
              relation_withname: item.main_name,
              relation_name: memberrelation[0]?.relation_name ? memberrelation[0]?.relation_name : "",
              new_child: 1,
              tenant_id: tenant_id
            }
            const resultInsRel = await insertMemberRelations_new(relData);
          }));




        } else {


          //  already have memeber then else part 


          const members_detail = await fetchMemberDetailsByfamily_id(family_id, tenant_id);

          for (const item of members_detail) {
            let newMemberDetails = member_details.filter(elem => elem.id === item.id);

            if (newMemberDetails[0]?.relation === 'Main Group') {
              let detail = {
                groupname: newMemberDetails[0].name,
                groupBy: 'Facility',
                TenantID: tenant_id,
                is_subgroup: 0,
                member_id: item.id ? item.id : 0,
                member_group_id: 0,
                is_main_group: 1
              };

              let resultSet1 = await addGroup(detail); // Await works here!
              arraymember.push(resultSet1.insertId);
            }

            if (newMemberDetails[0]?.relation == 'Sub Group') {
              //console.log("entered")
              let detail1 = {
                groupname: newMemberDetails[0].name,
                groupBy: 'Facility',
                TenantID: tenant_id,
                is_subgroup: 1,
                member_id: item.id ? item.id : 0,
                member_group_id: arraymember[0] ? arraymember[0] : 0,
                is_main_group: 0

              }

              let supgroup = await addGroup(detail1);
              var sub_group_id = supgroup.insertId
            }

            if (newMemberDetails[0]?.relation == 'Facility') {

              // console.log(member_details[i].fid); 

              const datafetxch = await fetchgroupdetail(newMemberDetails[0].fid)

              let detail2 = {
                AssestName: newMemberDetails[0].name ? newMemberDetails[0].name : "",
                AssestType: newMemberDetails[0].facility_name ? newMemberDetails[0].facility_name : "",
                CountryId: '101',
                TenantID: tenant_id,
                member_id: item.id ? item.id : 0,
                sub_group_id: datafetxch[0]?.id ? datafetxch[0]?.id : 0
              }
              const facilitiesid = await addFacilities(detail2);
              let facilityId = facilitiesid.insertId

              if (newMemberDetails[0].fid) {

                if (datafetxch.length > 0) {
                  let detail3 = {
                    groupId: arraymember[0] ? arraymember[0] : 0,
                    CountryId: 101,
                    facilityId: facilityId,
                    sub_group_id: datafetxch[0].id,
                    tenant_id: tenant_id,
                  }
                  const Groupmap = await addGroupmapping(detail3);

                }

              }

            }
          }


        }

        let data = {
          is_saved: 1
        }

        let where = ` where  family_id = '${family_id}' and tenant_id = '${tenant_id}'`;
        const memberdetails = await updateData('member_details_new', where, data)
        const memberdetails1 = await updateData('members_relation_new', where, data)



        return res.json({
          success: true,
          message: "Family added Successfully",
          status: 200,
          insertDetails: insertDetails,
          family_id: family_id
        })

      } else {
        res.json({
          success: false,
          status: 400,
          message: "Database Error while inserting family",
        });
      }
    } else {
      res.json({
        success: false,
        status: 400,
        message: "Family Not Found!",
      });

    }
  } catch (error) {
    console.log(error)
    res.json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.deleteFamilyMember = async (req, res) => {
  try {
    const { family_id, tenantId } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        family_id: [Joi.number().required().empty()],
        tenantId: [Joi.number().required().empty()],
      })
    );
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

    // let where = `where id  = '${family_id}' `;
    // const updateDetails = await deleteData('`family_details`', where)

    let where2 = `where family_id  = '${family_id}' and tenant_id = '${tenantId}'`;
    const updateDetails = await deleteData('`member_details_new`', where2)

    let where1 = ` where family_id  = '${family_id}' and tenant_id = '${tenantId}' `;
    const updateDetails1 = await deleteData('`members_relation_new`', where1)


    if (updateDetails.affectedRows > 0) {
      return res.json({
        status: 200,
        message: "Tree deleted successfully...",
        success: true,
        updateDetails: updateDetails,
      });
    }
    else {
      return res.json({
        status: 400,
        message: "No details found for the family id in database",
        success: false,
        updateDetails: [],
      });
    }
  } catch (error) {

    res.json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }

};