const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {

  fetchDetailsByFamilyID :(async (family_id) => {
        return db.query('select * from member_details where family_id=? order by level_at_tree asc',[family_id]);
  }), 
  

  fetchDetailsByFamilyIDrelation:(async (family_id) => {
      return db.query('select * from members_relation where family_id=? order by level asc',[family_id]);
  }), 



  fetchDetailtenant_id:(async (tenant_id) => {
    return db.query('select * from member_details_new where tenant_id = ? and is_saved = 0',[tenant_id]);
   }), 



  fetchDetailsnewchild:(async (family_id,id,tenant_id) => {
    return db.query('select * from member_details_new where family_id=?  and new_relation_id = ? and tenant_id = ?',[family_id,id,tenant_id]);
   }), 


   fetchDetailsnewchild_id:(async (family_id,id) => {
    return db.query('select * from member_details_new where family_id=?  and id = ?',[family_id,id]);
   }), 


   fetchDetails :(async (id) => {
      return db.query('select * from family_details_new where tenant_id= ? and default_tree = 0',[id] );
    }),

    
   fetchdetails_new:(async (tenant_id,id) => {
    return db.query('select * from family_details_new where tenant_id= ? and id = ?',[tenant_id,id] );
  }),


  fetchDetailsbydefault :(async () => {
    return db.query('select * from family_details where default_tree = 1' );
  }),

  fetchDetailsbyId :(async (id) => {
    return db.query('select * from family_details where id = ?',[id]);
  }),

  fetchRelationbyIdFamilyId :(async (id, family_id) => {
        return db.query('select * from members_relation where family_id=? and id =?',[family_id, id]);
    }), 

    
  fetchRelationbyIdFamilyId_new :(async (id, family_id,tenant_id) => {
      return db.query('select * from members_relation_new where family_id=? and id =? and tenant_id =? ',[family_id, id ,tenant_id]);
  }), 


    
    insertFamily: (async (data) =>{
        return db.query(
            "INSERT INTO `family_details` (family_name, user_id, total_family_members,tenant_id) VALUES (?,?,?,?)",
            [ data.name,
              data.user_id,
              data.total_members,
              data.tenant_id
            ]
        )
       }),


       insertFamily_new: (async (data) =>{
        return db.query(
            "INSERT INTO `family_details_new` (id,family_name, user_id, total_family_members,tenant_id,maingroup_id) VALUES (?,?,?,?,?,?)",
            [ data.id,
              data.name,
              data.user_id,
              data.total_members,
              data.tenant_id,
              data.maingroup_id
            ]
        )
       }),
       insertMemberDetails : (async (data)=>{
        return db.query(
            "INSERT INTO `member_details` (family_id, main_name, level_at_tree ,name ,facility_name, has_child,new_relation_id) VALUES (?,?,?,?,?,?,?)",
            [
              data.family_id,
              data.main_name,
              data.level_at_tree,
              data.name,
              data.facility_name,
              data.has_child,
              data.new_child,
           
            ]
          )
   }),

   insertMemberRelations : (async (data) =>{
    return db.query(
        "INSERT INTO `members_relation` (id, father_id, mother_id ,partner_id, relation_with_id, relation_withname ,relation_name, family_id, level,new_relation_id) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [
          data.id,
          data.father_id,
          data.mother_id,
          data.partner_id,
          data.relation_with_id,
          data.relation_withname,
          data.relation_name,
          data.family_id,
          data.level,
          data.new_child,
         
        ]
      )
   }),



   insertMemberDetails_new : (async (data)=>{
    return db.query(
        "INSERT INTO `member_details_new` (family_id, main_name, level_at_tree ,name ,facility_name, has_child,new_relation_id,tenant_id) VALUES (?,?,?,?,?,?,?,?)",
        [
          data.family_id,
          data.main_name,
          data.level_at_tree,
          data.name,
          data.facility_name,
          data.has_child,
          data.new_child,
          data.tenant_id
        ]
      )
}),

insertMemberRelations_new : (async (data) =>{
return db.query(
    "INSERT INTO `members_relation_new` (id, father_id, mother_id ,partner_id, relation_with_id, relation_withname ,relation_name, family_id, level,new_relation_id,tenant_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [
      data.id,
      data.father_id,
      data.mother_id,
      data.partner_id,
      data.relation_with_id,
      data.relation_withname,
      data.relation_name,
      data.family_id,
      data.level,
      data.new_child,
      data.tenant_id
      
    ]
  )
}),

fetchMemberDetailsById : (async(id, family_id) => {
    return db.query('select * from member_details where family_id=? and id =?',[family_id, id])
}),

fetchMemberDetailsById_new : (async(id, family_id) => {
  return db.query('select * from member_details_new where family_id=? and id =?',[family_id, id])
}),

fetchMemberDetailsBylevel : (async(level_at_tree, family_id) => {
  return db.query('select * from member_details where family_id=? and level_at_tree =? order by level_at_tree asc',[family_id, level_at_tree])
}),

fetchMemberDetailsBylevel_new : (async(level_at_tree, family_id) => {
  return db.query('select * from member_details_new where family_id=? and level_at_tree =? order by level_at_tree asc',[family_id, level_at_tree])
}),

addFacilities: (async (data) =>{
  return db.query(
      "INSERT INTO `dbo.facilities` (AssestName, AssestType,CountryId,TenantID,member_id,sub_group_id) VALUES (?,?,?,?,?,?)",
      [ data.AssestName,
        data.AssestType,
        data.CountryId,
        data.TenantID,
        data.member_id,
        data.sub_group_id,
      ]
  )
 }),


 addGroup: (async (data) =>{

  return db.query(
      "INSERT INTO `dbo.group` (groupname,groupBy,TenantID,is_subgroup,member_id,member_group_id,is_main_group) VALUES (?,?,?,?,?,?,?)",
      [ data.groupname,
        data.groupBy,
        data.TenantID,
        data.is_subgroup,
        data.member_id,
        data.member_group_id,
        data.is_main_group
      ]
  )
 }),
 addGroupForCreateTree: (async (data) =>{

  return db.query(
      "INSERT INTO `dbo.group` (groupname,groupBy,TenantID,is_subgroup,member_id,member_group_id,is_main_group,subGroup_templateID) VALUES (?,?,?,?,?,?,?,?)",
      [ data.groupname,
        data.groupBy,
        data.TenantID,
        data.is_subgroup,
        data.member_id,
        data.member_group_id,
        data.is_main_group,
        data.subGroup_templateID
      ]
  )
 }),


 addGroupmapping: (async (data) =>{
  return db.query(
      "INSERT INTO `dbo.groupmapping` (groupId,CountryId,facilityId,sub_group_id,tenant_id) VALUES (?,?,?,?,?)",
      [ data.groupId,
        data.CountryId,
        data.facilityId,
        data.sub_group_id,
        data.tenant_id
      ]
  )
 }),


 fetchgroupdetail : (async(member_id) => {
  return db.query('select * from  `dbo.group` where member_id =? and is_subgroup = 1 ',[member_id])
}),
fetchMainGroupId : (async(tenandId) => {
  return db.query('select * from  `dbo.group` where tenantID =? and is_main_group = 1',[tenandId])
}),
 fetchgroupdetailForFacilites : (async(member_id , tenant_id) => {
  return db.query('select * from  `dbo.group` where subGroup_templateID =? and is_subgroup = 1 and tenantID = ? ',[member_id ,tenant_id ])
}),

fetchfacilitiesdetail : (async(member_id) => {
  return db.query('select * from  `dbo.facilities` where member_id =? ',[member_id])
}),

 fetchMemberDetails_new: (async(family_id,tenant_id) => {
  return db.query('select * from member_details_new where family_id=?  and tenant_id =? order by level_at_tree asc',[family_id,tenant_id])
}),

 fetchMemberDetailsByorder : (async(family_id) => {
  return db.query('select * from member_details where family_id=? order by id desc limit 1',[family_id])
}),


fetchMemberup : (async(family_id,user_id) => {
  return db.query('select * from member_updated where family_id=? and user_id = ? order by id desc',[family_id,user_id])
}),


insertMemberupdated : (async (data) =>{
  return db.query(
      "INSERT INTO `member_updated` (updated_member,delete_member,added_member,user_id,family_id) VALUES (?,?,?,?,?)",
      [
        data.updated_member,
        data.delete_member,
        data.added_member,
        data.user_id,
        data.family_id
      ]
    )
  }),

  fetchMemberDetailsByfamily_id : (async(family_id,tenant_id) => {
    return db.query('select * from member_details_new where family_id=? and tenant_id = ?',[family_id,tenant_id])
  }),
}