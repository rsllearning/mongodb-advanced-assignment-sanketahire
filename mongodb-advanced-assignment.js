use company_advanced;

db.employees.drop();

db.createCollection("employees", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "departmentId", "experience", "active"],
      properties: {
        name: { bsonType: "string" },
        departmentId: { bsonType: "int" },
        experience: { bsonType: "int" },
        active: { bsonType: "bool" }
      }
    }
  }
});

db.employees.insertMany([
  {
    _id: 1,
    name: "John",
    departmentId: NumberInt(10),
    skills: ["Java", "MongoDB"],
    experience: NumberInt(4),
    active: true,
    certifications: [
      { name: "MongoDB", status: "Expired", expiryYear: NumberInt(2026) }
    ]
  },
  {
    _id: 2,
    name: "Alice",
    departmentId: NumberInt(10),
    skills: ["Python", "MongoDB"],
    experience: NumberInt(6),
    active: true,
    certifications: [
      { name: "MongoDB", status: "Active", expiryYear: NumberInt(2028) }
    ]
  },
  {
    _id: 3,
    name: "David",
    departmentId: NumberInt(20),
    skills: ["Communication"],
    experience: NumberInt(3),
    active: false,
    certifications: [
      { name: "Communication", status: "Active", expiryYear: NumberInt(2027) }
    ]
  }
]);

db.employees.insertOne({
  _id: 99,
  name: 123,
  departmentId: "HR",
  experience: "one",
  active: "yes"
});

db.employees.countDocuments();

db.employees.find({
  certifications: {
    $elemMatch: { name: "MongoDB", status: "Active" }
  }
});

db.employees.updateOne(
  { _id: 1, "certifications.name": "MongoDB" },
  { $set: { "certifications.$.status": "Active" } }
);

db.employees.findOne({ _id: 1 }, { name: 1, certifications: 1 });

db.employees.updateOne(
  { _id: 1 },
  { $set: { "certifications.$[c].status": "Renewal Due" } },
  { arrayFilters: [{ "c.expiryYear": { $lt: 2027 } }] }
);

db.employees.find({}, { name: 1, certifications: 1 });

db.employees.bulkWrite([
  {
    updateOne: {
      filter: { name: "John" },
      update: { $inc: { experience: NumberInt(1) } }
    }
  },
  {
    updateOne: {
      filter: { name: "Alice" },
      update: { $set: { active: false } }
    }
  },
  {
    insertOne: {
      document: {
        _id: 4,
        name: "Emma",
        departmentId: NumberInt(20),
        skills: ["Excel"],
        experience: NumberInt(2),
        active: true,
        certifications: [
          { name: "Excel", status: "Active", expiryYear: NumberInt(2026) }
        ]
      }
    }
  }
]);

db.employees.findOne({ name: "John" });

db.employees.findOne({ name: "Alice" });

db.employees.countDocuments();

db.departments.drop();

db.departments.insertMany([
  { _id: NumberInt(10), name: "Engineering" },
  { _id: NumberInt(20), name: "HR" }
]);

db.employees.aggregate([
  {
    $lookup: {
      from: "departments",
      localField: "departmentId",
      foreignField: "_id",
      as: "department"
    }
  },
  { $unwind: "$department" },
  {
    $project: {
      _id: 0,
      name: 1,
      departmentName: "$department.name"
    }
  },
  { $sort: { name: 1 } }
]);

db.employees.aggregate([
  {
    $lookup: {
      from: "departments",
      localField: "departmentId",
      foreignField: "_id",
      as: "department"
    }
  },
  { $unwind: "$department" },
  { $count: "totalJoinedEmployees" }
]);

db.employees.aggregate([
  { $unwind: "$skills" },
  {
    $group: {
      _id: "$skills",
      employeeCount: { $sum: 1 }
    }
  },
  { $sort: { employeeCount: -1, _id: 1 } }
]);

db.employees.aggregate([
  { $match: { active: true } },
  {
    $facet: {
      activeEmployees: [
        { $sort: { name: 1 } },
        { $project: { _id: 0, name: 1 } }
      ],
      totalCount: [
        { $count: "activeEmployees" }
      ]
    }
  }
]);

db.employees.createIndex(
  { departmentId: 1, name: 1 },
  { name: "departmentId_1_name_1" }
);

db.employees.getIndexes();

db.employees.find({ departmentId: 10 }).sort({ name: 1 }).explain("executionStats");

db.sessions.drop();

db.sessions.insertOne({
  _id: 1,
  userName: "John",
  expiresAt: new Date(Date.now() + 600000)
});

db.sessions.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "expiresAt_1" }
);

db.sessions.getIndexes();
