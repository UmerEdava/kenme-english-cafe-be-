const mongoose = require("mongoose");

var admin = require("firebase-admin");
var serviceAccount = require("../firebase.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

const User = require("../models/user");
const Banner = require("../models/banner");
const Phone = require("../models/phone");
const Feedback = require("../models/feedback");
const Officials = require("../models/officials");
const Devices = require("../models/devices");
const { get } = require("lodash");
const moment = require("moment");
const Batches = require("../models/batches");
const { getAmount } = require("./user");
const {
  triggetNotification,
  NOTI_TYPE,
} = require("../utils/push_notification");




const ObjectId = require("mongoose").Types.ObjectId;

exports.get_banner = async (req, res, next) => {
  Banner.find()
    .exec()
    .then(async (banners) => {
      return res
        .status(200)
        .json({ status: true, data: banners, message: "Banners list" });
    })
    .catch(async (e) => {
      return res
        .status(500)
        .json({ status: false, error: e, message: "Failed!!!!!!!" });
    });
};

exports.home_contents = async (req, res, next) => {
  Banner.find()
    .exec()
    .then(async (banners) => {
      return res
        .status(200)
        .json({
          status: true,
          data: { banners: banners.map((e)=>e.file) },
          message: "Home Page contents",
        });
    })
    .catch(async (e) => {
      return res
        .status(500)
        .json({ status: false, error: e, message: "Failed!!!!!!!" });
    });
};
exports.dashboard = async (req, res, next) => {
  res.status(200).json({
    status: true,
    message: "Dashboard count",
    data: {
      total_user: await User.count({}),
      active_user: await User.count({ isAdmited: true, days: { $gte: 0 } }),

      certified_users: 0,
    },
  });
};
exports.feedbacks = async (req, res, next) => {
  Feedback.find()
    .exec()
    .then(async (banners) => {
      return res
        .status(200)
        .json({ status: true, data: banners, message: "Banners List" });
    })
    .catch(async (e) => {
      return res
        .status(500)
        .json({ status: false, error: e, message: "Failed!!!!!" });
    });
};
exports.login = async (req, res, next) => {
  const email = req.body.user_name;
  const password = req.body.password;

  if (email == "admin@kenme.com" && password == "admin2120@#") {
    return res.status(200).json({ status: true, message: "Login Success" });
  } else {
    return res.status(500).json({ status: false, message: "Login Failed" });
  }
};

exports.add_feedback = async (req, res, next) => {
  var feedback = Feedback({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    contact_no: req.body.contact_no,
    subject: req.body.subject,
    feedback: req.body.feedback,
  });
  feedback
    .save()
    .then(async (result) => {
      return res.status(200).json({
        status: true,
        data: result,
        message: "Feedback saved succesfully",
      });
    })
    .catch(async (result) => {
      console.log(result);
      return res.status(500).json({
        status: false,
        status: "Error",
      });
    });
};
exports.add_banner = async (req, res, next) => {
  const name = req.body.name;
  const file = req.files["file"][0]["location"];

  const banner = new Banner({
    _id: new mongoose.Types.ObjectId(),
    tittle: name,
    file,
  });

  banner
    .save()
    .then(async (result) => {
      return res.status(200).json({
        status: true,
        data: result,
        status: "Banner uploaded succesfully",
      });
    })
    .catch(async (result) => {
      console.log(result);
      return res.status(500).json({
        status: false,
        status: "Banner uploaded failed",
      });
    });
};

exports.delete_banner = async (req, res, next) => {
  Banner.deleteOne({ _id: req.params.id })
    .then(function () {
      res.status(200).json({ status: true, message: "deleted" });
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).json({ status: false, message: "note deleted" });
    });
};

exports.get_number = async (req, res, next) => {
  Phone.find()
    .exec()
    .then(async (phone) => {
      return res
        .status(200)
        .json({ status: true, data: phone, message: "Phone list" });
    })
    .catch(async (e) => {
      return res
        .status(500)
        .json({ status: false, error: e, message: "Failed!!!!!!!" });
    });
};

exports.create_number = async (req, res, next) => {
  var phone = Phone({
    _id: new mongoose.Types.ObjectId(),
    number: req.body.number,
    name: req.body.name,
  });
  phone
    .save()
    .then(async (result) => {
      return res.status(200).json({
        status: true,
        data: result,
        status: "Phone succesfully",
      });
    })
    .catch(async (result) => {
      console.log(result);
      return res.status(500).json({
        status: false,
        status: "Error",
      });
    });
};

exports.clear_feedbacks = async (req, res, next) => {
  Feedback.deleteMany({})
    .then(function () {
      res.status(200).json({ status: true, message: "deleted" });
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).json({ status: false, message: "number deleted" });
    });
};

exports.delete_phone = async (req, res, next) => {
  Phone.deleteOne({ _id: req.params.id })
    .then(function () {
      res.status(200).json({ status: true, message: "deleted" });
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).json({ status: false, message: "number deleted" });
    });
};

exports.sendNotification = async (req, res, next) => {
  const registrationTokens = [""];

  const message = {
    notification: { title: req.body.title, body: req.body.body },
    data: { title: req.body.title, body: req.body.body },
  };

  admin
    .messaging()
    .sendToDevice(req.body.token, message)
    .then((response) => {
      res.status(200).json({
        status: true,
        message: response.successCount + " messages were sent successfully",
      });
    })
    .catch((e) => {
      res.status(200).json({ status: false, message: "Failed", error: e });
    });
};

exports.createOfficials = async (req, res, next) => {
  if (req.body.role === "counsellor" && !req.body.basic_salary)
    return res.status(500).json({
      status: false,
      status: "Error",
      message: "Basic pay is mandatory",
    });

  var officials = Officials({
    _id: new mongoose.Types.ObjectId(),
    ...req.body,
  });
  officials
    .save()
    .then(async (result) => {
      return res.status(200).json({
        status: true,
        data: result,
        status: "User added success",
      });
    })
    .catch(async (result) => {
      console.log(result);
      return res.status(500).json({
        status: false,
        status: "Error",
        message: result.message ?? "",
      });
    });
};

exports.updateOfficials = async (req, res, next) => {
  Officials.update(
    { _id: req.body.id },
    {
      name: req.body.name,
      username: req.body.username,
      contact_no: req.body.contact_no,
      basic_salary: req.body.basic_salary,
      created_at: Date.now(),
    }
  )
    .exec()
    .then(async (data) => {
      return res
        .status(200)
        .json({ status: true, data: data, message: "Updated" });
    })
    .catch(async (e) => {
      return res
        .status(500)
        .json({ status: false, error: e.message, message: "Failed!!!!!!!" });
    });
};
exports.getOfficials = async (req, res, next) => {
  const query = req.body.query;
  let datum = {};
  if (req.body.role) datum.role = req.body.role;
  if (req.body.name) datum.name = req.body.name;
  if (req.body.number) datum.number = req.body.number;

  Officials.aggregate([
    {
      $match: { name: new RegExp(query, "i") },
      ...(req.body.role && { $match: { role: req.body.role } }),
    },
    {
      $lookup: {
        from: "devices",
        localField: "_id",
        foreignField: "user_id",
        as: "devices",
      },
    },
  ])
    .exec()
    .then(async (data) => {
      return res.status(200).json({
        status: true,
        data: data,
        message: "All staffs",
      });
    })
    .catch(async (e) => {
      return res
        .status(500)
        .json({ status: false, error: e.message, message: "Failed!!!!!!!" });
    });
};

exports.deleteOfficials = async (req, res, next) => {
  Officials.deleteOne({ _id: req.params.id })
    .then(function () {
      res.status(200).json({ status: true, message: "deleted" });
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).json({ status: false, message: "can't delete" });
    });
};

exports.loginOfficials = async (req, res, next) => {
  Officials.findOne(
    { username: req.body.username },
    async function (err, user) {
      if (err || !user) {
        return res
          .status(500)
          .json({ status: false, error: err, message: "can't authenticate" });
      }

      if (user.password == req.body.password) {
        await Officials.findOneAndUpdate(
          { username: req.body.username },
          {
            $set: {
              fcm_token: req.body.fcm_token,
            },
          }
        );
        await Devices.findOneAndUpdate(
          {
            device: req.body.device,
            user_id: user.id,
          },
          {
            $set: {
              device_id: req.body.deviceId,
              version: req.body.version,
              version: req.body.version,
              user_id: user.id,
              created_at: moment(),
            },
          },
          { upsert: true, multi: true }
        );
        return res.status(200).json({
          status: true,
          data: user,
          message: "Authenticattion Success",
        });
      } else
        return res
          .status(500)
          .json({ status: false, error: err, message: "Invalid Password" });
    }
  );
};

exports.uploadReceipt = async (req, res, next) => {
  return res.status(200).json({
    status: true,
    message: "Upload Success",
    data: {
      url: req.file.location,
    },
  });
};

exports.createStudent = async (req, res, next) => {
  if (!get(req, "body.email")) {
    return res.status(500).json({
      status: false,
      message: "Please Give Email ID for registeration",
    });
  }
  if (!get(req, "body.phone")) {
    return res
      .status(500)
      .json({ status: false, message: "Please Give Mobile for registeration" });
  }
  if (!get(req, "body.name")) {
    return res
      .status(500)
      .json({ status: false, message: "Please Give Names for registeration" });
  }

  var bool = await User.findOne({
    phone: req.body.phone,
  });
  if (bool != null) {
    return res
      .status(500)
      .json({ status: false, message: "User already registered" });
  }

  var data = {
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    gender: req.body.gender,
    place: req.body.place,
    has_referral: req.body.has_referral,
    amount: req.body.amount ?? 0,
    created_at: moment(),
  };

  if (req.body.level) {
    data.level = req.body.level.toLowerCase();

    if (data.level === "advanced") data.marks = "10";
    else if (data.level === "secondary") data.marks = "8";
    else data.marks = "5";
  }

  if (req.body.batch_date) {
    data.batch_date = req.body.batch_date;
    data.admited_by = req.body.admited_by;
    data.admited_at = moment();
    data.isAdmited = true;
  }
  if (req.body.receipt) {
    const duplicateData = await User.findOne({
      receipt: {
        $elemMatch: { transaction_id: req.body.receipt[0].transaction_id },
      },
    });
    if (duplicateData)
      return res.status(500).json({
        status: false,
        message: "Invalid Transaction ID",
      });

    data.receipt = req.body.receipt;
  }

  const user = new User(data);
  user
    .save()
    .then(async (result) => {
      try {
        return res.status(200).json({
          status: true,
          data: result,
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          status: false,
          message: `Registeration saving Error -> ${err}`,
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        status: false,
        message: `Registeration saving Error -> ${err}`,
      });
    });
};

exports.createBatch = async (req, res, next) => {
  if (!req.body.admited_by)
    return res.status(500).json({
      status: false,
      message: `Who is doing this`,
    });
  if (!req.body.students)
    return res.status(500).json({
      status: false,
      message: `Please select atleast one student`,
    });

  User.updateMany(
    { phone: { $in: req.body.students } },
    {
      $set: {
        ...req.body,
        isAdmited: true,
        ...(req.body.newCreation && { admited_at: moment() }),
        ...(req.body.batch_date && { batch_date: req.body.batch_date }),
      },
    },
    { multi: true },
    function (err, records) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: err,
        });
      }
      triggetNotification(req, NOTI_TYPE.BR_CREATE);

      return res.status(200).json({
        status: true,
        message: "Batch created succefully",
        records: records,
      });
    }
  );
};

exports.deleteBatch = async (req, res, next) => {
  if (!req.body.students)
    return res.status(500).json({
      status: false,
      message: `Please select atleast one student`,
    });

  User.updateMany(
    { phone: { $in: req.body.students } },
    {
      $set: {
        isAdmited: false,
        tutor: null,
        admited_at: null,
        admited_by: null,
        batch_date: null,
      },
    },
    { multi: true },
    function (err, records) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: err,
        });
      }
      triggetNotification(req, NOTI_TYPE.BR_DELETE);
      return res.status(200).json({
        status: true,
        message: "Removed from batch  succefully",
        records: records,
      });
    }
  );
};

exports.getAdmittedCount = async (req, res, next) => {
  const admittedCount = await User.countDocuments({
    admited_by: req.params.id,
  });
  const pendingCount = await User.countDocuments({
    "receipt.payed_by": new ObjectId(req.params.id),
    level: { $exists: true },
    admited_by: { $eq: null },
    batch_date: { $eq: null },
    isAdmited: false,
  });
  return res.status(200).json({
    status: true,
    message: "Batch created succefully",
    data: `${admittedCount}##${pendingCount}`,
  });
};

exports.getLinkedStudents = async (req, res, next) => {
  let users = [];
  if (req.body.role == "counsellor") {
    users = await User.find({ admited_by: req.body.id }).populate(
      "tutor",
      "name"
    );
  }
  if (req.body.role == "tutor") {
    users = await User.find({ tutor: req.body.id }).populate("tutor", "name");
  }
  if (req.body.role == "receptionist") {
    users = await User.find({
      "review.reviewer_id": req.body.id,
    }).populate("tutor", "name");
  }
  return res.status(200).json({
    status: true,
    message: "Linked Students",
    data: users,
  });
};

exports.getAdminFilters = async (req, res, next) => {
  const officials = await Officials.find();
  let batchDate = remove_duplicates_es6(
    (await User.find({ batch_date: { $ne: null } }).distinct("batch_date")).map(
      (e) => e
    )
  );

  const filters = [
    {
      type: "bool",
      label: "Admitted",
      key: "isAdmited",
      value: "",
    },
    {
      type: "dropdown",
      label: "Payment",
      key: "paymentStatus",
      value: null,
      options: [
        {
          id: "fp",
          name: "Full Paid",
        },
        {
          id: "fmp",
          name: "Family Pack",
        },
        {
          id: "pp",
          name: "Partially Paid",
        },
      ],
    },
    {
      type: "dropdown",
      label: "Tutor",
      key: "tutor",
      value: null,
      options: officials
        .filter((e) => e.role == "tutor")
        .map((e) => {
          return { id: e.id, name: e.name };
        }),
    },
    {
      type: "dropdown",
      label: "Batch",
      key: "batch_date",
      options: batchDate.map((e) => {
        return { id:e, name: e };
      }),
    },
  ];
  if (req.headers?.role !== "counsellor")
    filters.push({
      type: "dropdown",
      label: "Counsellor",
      key: "admited_by",
      value: null,
      options: officials
        .filter((e) => e.role == "counsellor")
        .map((e) => {
          return { id: e.id, name: e.name };
        }),
    });

  return res.status(200).json({
    status: true,
    message: "Admitted Students",
    data: filters,
  });
};

function remove_duplicates_es6(arr) {
  let s = new Set(arr);
  let it = s.values();
  return Array.from(it);
}

exports.bulkOps = async (req, res, next) => {
   return await User.find({
     
    amount: 3000,
    level: 'secondary',
    
  })
    .limit(150)
    .sort({ created_at: -1 })

    .then(async (e) => {
      return res.status(200).json({
        status: false,
        length: e.length,
        message: e,
      });
      for (let index = 0; index < e.length; index++) {
        const element = e[index];
        await User.findOneAndUpdate(
          { phone: element.phone },
          {
            has_referral: true,
          }
        );
      }
      res.status(200).json({
        status: true,
        length: e.length,
        message: e,
      });
    });

  User.updateMany(
    { phone: "91333333" },
    {
      $set: {
        // isAdmited: false,
        // tutor: null,
        // admited_at: null,
        // admited_by: null,
        // batch_date: null,
        receipt: [],
        // review: [],
      },
    },
    { multi: true },
    function (err, records) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: err,
        });
      }
      return res.status(200).json({
        status: true,
        message: "Removed from batch  succefully",
        records: records,
      });
    }
  );
};

exports.createBatches = async (req, res, next) => {
  if (req.body.batches) {
    const batches = req.body.batches.map((b) => Batches({ date: b }));
    Batches.insertMany(batches)
      .then((docs) => {
        return res.status(200).json({
          status: false,
          data: docs,
          message: "Batch creation success",
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({
          status: false,
          error,
          message: "Batch creation failed",
        });
      });
  } else {
    return res.status(500).json({
      status: false,
      message: "Batch creation failed",
    });
  }
};

exports.getBatches = async (req, res, next) => {
  return res.status(200).json({
    status: true,
    message: "Created Batches",
    data: (await Batches.find()).map((e) => e.date),
  });
};

exports.closeBatch = async (req, res, next) => {
  try {
    console.log(req.body.date);
    return res.status(200).json({
      status: true,
      message: "Closed Batch",
      data: await Batches.deleteOne({ date: req.body.date }),
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to close batch",
      data: await Batches.deleteOne({ date: req.body.date }),
    });
  }
};
