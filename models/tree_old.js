const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {

    fetchDetailsByFamilyID :(async (family_id) => {
        return db.query('select * from member_details where family_id=? order by level_at_tree asc',[family_id]);
    }), 

   fetchDetails :(async (id) => {
      return db.query('select * from family_details where tenant_id= ? and default_tree = 0',[id] );
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
       insertMemberDetails : (async (data)=>{
        return db.query(
            "INSERT INTO `member_details` (family_id, main_name, level_at_tree ,name ,facility_name, has_child) VALUES (?,?,?,?,?,?)",
            [
              data.family_id,
              data.main_name,
              data.level_at_tree,
              data.name,
              data.facility_name,
              data.has_child
            ]
          )
   }),

   insertMemberRelations : (async (data) =>{
    return db.query(
        "INSERT INTO `members_relation` (id, father_id, mother_id ,partner_id, relation_with_id, relation_withname ,relation_name, family_id, level) VALUES (?,?,?,?,?,?,?,?,?)",
        [
          data.id,
          data.father_id,
          data.mother_id,
          data.partner_id,
          data.relation_with_id,
          data.relation_withname,
          data.relation_name,
          data.family_id,
          data.level
        ]
      )
   }),

fetchMemberDetailsById : (async(id, family_id) => {
    return db.query('select * from member_details where family_id=? and id =?',[family_id, id])
}),

fetchMemberDetailsBylevel : (async(level_at_tree, family_id) => {
  return db.query('select * from member_details where family_id=? and level_at_tree =? order by level_at_tree asc',[family_id, level_at_tree])
}),


}