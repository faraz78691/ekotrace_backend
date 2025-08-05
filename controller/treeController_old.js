const Joi = require("joi");
const moment = require("moment");
const config = require("../config");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { fetchDetailsByFamilyID, insertFamily, fetchDetails, insertMemberDetails, insertMemberRelations,
  fetchRelationbyIdFamilyId, fetchMemberDetailsById, fetchDetailsbyId, fetchMemberDetailsBylevel, fetchDetailsbydefault } = require("../models/tree")
const { getSelectedColumn, updateData, deleteData } = require("../models/common");
const baseurl = config.base_url;
const bcrypt = require('bcryptjs');

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
      console.log(familyTreeDetails);
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


    const authHeader = req.headers.auth;
    const jwtToken = authHeader.replace("Bearer ", "");
    const decoded = jwt.decode(jwtToken);
    const user_id = decoded.user_id;


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
}
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
exports.addChildInTree = async (req, res) => {
  try {
    const { id, family_id, main_name, name, facility_name } =
      req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().required().empty()],
        family_id: [Joi.number().required().empty()],
        main_name: [Joi.string().required().empty()],
        name: [Joi.string().required().empty()],
        facility_name: [Joi.optional().allow("")],
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


    const memberData = {
      family_id: family_id,
      level_at_tree: 0,
      has_child: "",
      marital_status: "",
      main_name: main_name,
      name: name ? name : "",
      facility_name: facility_name ? facility_name : ""

    };
    const responseReturned = await addChild(id, family_id, memberData, "Son");
    if (responseReturned) {
      return res.json({
        status: 200,
        message: "Node Added Successfully",
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
exports.deleteNode = async (req, res) => {
  try {
    const { family_id, id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        family_id: [Joi.number().required().empty()],
        id: [Joi.number().required().empty()],
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

    let where = `where family_id  = '${family_id}' and id = '${id}'`;
    const updateDetails = await deleteData('`member_details`', where)


    let where1 = ` where family_id  = '${family_id}' and id = '${id}'`;
    const updateDetails1 = await deleteData('`members_relation`', where1)


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

}
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

}
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

    const authHeader = req.headers.auth;
    const jwtToken = authHeader.replace("Bearer ", "");
    const decoded = jwt.decode(jwtToken);
    const tenant_id = decoded.user_id;
    let familyDetails = "";

    familyDetails = await fetchDetails(tenant_id);

    if (familyDetails.length == 0) {
      familyDetails = await fetchDetailsbydefault();
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
    const { update_data } =
      req.body;
    const schema = Joi.alternatives(
      Joi.object({
        update_data: [Joi.optional().allow("")],
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
    let array = [];
    const jsonObject = JSON.parse(update_data);

    // if(jsonObject?.facility_name){
    //   name = jsonObject?.facility_name
    // }else{
    //   name = jsonObject.name
    // }
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
    const memberdetails = await updateData('member_details', where, memberData)
    const memberdetails1 = await updateData('members_relation', where, memberData1)

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
    //fetchDetailsbyId

    let familyDetails = await fetchDetails(tenant_id);
    if (familyDetails.length > 0) {
      res.json({
        success: false,
        status: 400,
        message: "You have already added Tree",
      });
    }

    const familyDetail = await fetchDetailsbyId(family_id);

    const member_details = JSON.parse(jsonData);


    // await Promise.all(member_details?.map(async (item) => {
    //   console.log(item);
    // }));
    // return false;
    //  const member_details = await fetchDetailsByFamilyID(family_id);

    if (familyDetail.length > 0) {
      const familyDetails = {
        user_id: tenant_id,
        tenant_id: tenant_id,
        name: familyDetail[0].family_name,
        total_members: 10
      }
      var insertDetails = await insertFamily(familyDetails);

      if (insertDetails.affectedRows > 0) {

        //  if (resultSet.affectedRows > 0) {
        // const relData = {
        //   id : resultSet.insertId,
        //   family_id: insertDetails.insertId,
        //   mother_id :0,
        //   father_id :0,
        //   partner_id : 0,
        //   level : 1,
        //   relation_with_id :0,
        //   relation_withname : "Main",
        //   relation_name : "Head"
        // }
        // const resultInsRel = await insertMemberRelations(relData);

        await Promise.all(
          member_details?.map(async (item) => {

            const memberData = {
              family_id: insertDetails.insertId,
              level_at_tree: item.level_at_tree,
              has_child: "N",
              main_name: item.relation,
              name: item.name ? item.name : "",
              facility_name: item.facility_name,
            };

            const resultSet = await insertMemberDetails(memberData);
          }));

        const members = await fetchDetailsByFamilyID(insertDetails.insertId);

        await Promise.all(members?.map(async (item) => {

          const memberslevel = await fetchMemberDetailsBylevel(1, insertDetails.insertId);

          const memberslevel1 = await fetchMemberDetailsBylevel(2, insertDetails.insertId);
          let relationname = "";
          let relationwith_id = 0;
          if (item.level_at_tree == 1) {
            relationname = 'Head'
            relationwith_id = 0;
          }
          if (item.level_at_tree == 2) {
            relationwith_id = memberslevel[0].id;
            relationname = 'Son'
          }

          if (item.level_at_tree > 2) {
            relationwith_id = memberslevel1[0].id;
            relationname = 'Son'
          }
          const relData = {
            id: item.id,
            family_id: item.family_id,
            mother_id: 0,
            father_id: relationwith_id,
            partner_id: 0,
            level: item.level_at_tree,
            relation_with_id: relationwith_id,
            relation_withname: item.main_name,
            relation_name: relationname,
          }
          const resultInsRel = await insertMemberRelations(relData);
        }));

        return res.json({
          success: true,
          message: "Family added Successfully",
          status: 200,
          insertDetails: insertDetails,
          family_id: insertDetails.insertId
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
}