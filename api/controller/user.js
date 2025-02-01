const mongoose = require("mongoose");
var vCardsJS = require("vcards-js");
var QRCode = require("qrcode");

const { get, omit, filter } = require("lodash");

const User = require("../models/user");
const DeletedUser = require("../models/deactivated_user");
const nodemailer = require("nodemailer");

const { GoogleSpreadsheet } = require("google-spreadsheet");
const doc = new GoogleSpreadsheet(
  "1RZh_aGmbcpzSeo6PUlcP0x7-i_IHxFAJCbhCYCkHJjw"
);
const ClassSchema = require("../models/class");
const moment = require("moment");
var pdf = require("pdf-creator-node");
var fs = require("fs");
var path = require("path");
const phone = require("../models/phone");
const Officials = require("../models/officials");
const {
  triggetNotification,
  NOTI_TYPE,
} = require("../utils/push_notification");

var ObjectId = require("mongoose").Types.ObjectId;

const SuccessErr = (data = null, msg = null) => {
  return {
    data,
    error: {
      message: msg,
    },
  };
};

// //user_login
// const addRow = async (element) => {
//   try {
//     await doc.useServiceAccountAuth(creds);

//     await doc.loadInfo(); // loads document properties and worksheets
//     const sheet = doc.sheetsByIndex[0];
//     await sheet.addRow({
//       email: element.email,
//       name: element.name,
//       phone: element.phone,
//       place: element.place,
//       gender: element.gender,
//       age: element.age,
//     });

//     // await row.save();
//     await sheet.saveUpdatedCells();
//   } catch (error) {
//     console.log(error);
//   }
// };
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.get_certificate = async (req, res, next) => {
  try {
    return res.status(200).json({
      status: true,
    });
  } catch (error) {
    console.log(error);
  }
  var html = fs.readFileSync(
    path.join(__dirname, "../../certificate/index.html"),
    "utf8"
  );

  var document = {
    html: html,
    data: {
      users: {
        name: "Mohd. Al-Fahad",
        duration: "60 days",
        category: "Advanced level",
      },
    },
    path: "./output.pdf",
    type: "pdf", // "stream" || "buffer" || "" ("" defaults to pdf)
  };
  console.log(document);
  var options = {
    format: "A3",
    orientation: "portrait",
  };
  pdf
    .create(document, options)
    .then((res) => {
      console.log(res);
      return res.status(200).json({
        status: true,
      });
    })
    .catch((error) => {
      return res.status(200).json({
        status: false,
      });
      console.error(error);
    });
};
exports.delete_class = async (req, res, next) => {
  ClassSchema.findOneAndRemove(
    { _id: req.params.id },
    req.body,
    function (err, data) {
      if (!err) {
        return res.status(200).json({
          status: true,
          data: data,
        });
      } else {
        return res.status(500).json({
          status: false,
          error: err,
        });
      }
    }
  );
};
exports.get_classes = async (req, res, next) => {
  var filters = {};
  if (req.body.content_type) filters.content_type = req.body.content_type;
  if (req.body.class_type)
    filters.class_type = req.body.class_type.toLowerCase();
  if (req.body.level) filters.level = req.body.level.toLowerCase();
  ClassSchema.find(filters)
    .then((result) => {
      console.log(result);
      return res.status(200).json({
        status: true,
        data: result,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        status: false,
        message: error,
      });
    });
};
exports.add_classess = async (req, res, next) => {
  const class_type = req.body.class_type.toLowerCase();
  const content_type = req.body.content_type;
  const tittle = req.body.title;
  const description = req.body.description;
  const level = req.body.level.toLowerCase();

  if (
    content_type != "note" &&
    content_type != "image" &&
    content_type != "audio" &&
    content_type != "video"
  ) {
    return res.status(500).json({
      status: false,
      message: "Invlid content type",
    });
  }
  if (class_type == null) {
    return res.status(500).json({
      status: false,

      message: "Invlid class type",
    });
  }
  if (!level)
    return res.status(500).json({
      status: false,

      message: "Invlid Level",
    });

  if (class_type && content_type) {
    const data = {
      _id: new mongoose.Types.ObjectId(),
      class_type,
      content_type,
      tittle,
      description,
      level,
    };
    if (content_type != "note" && req.files && req.files["file"]) {
      data.file = req.files["file"][0]["location"];
    } else if (content_type != "note" && (!req.files || !req.files["file"])) {
      return res.status(500).json({
        status: false,

        message: "You shuould upload a file",
      });
    }

    new ClassSchema(data).save(function (error) {
      if (!error) {
        return res.status(200).json({
          status: true,

          message: "Succesfully saved",
          data: data,
        });
      } else {
        console.log();
        return res.status(500).json({
          status: false,
          message: "Error adding class",
          error: error,
        });
      }
    });
  } else {
    return res.status(500).json({
      status: false,

      message: "all Params are improtant",
    });
  }
};
exports.questions = async (req, res, next) => {
  return res.status(200).json({
    status: true,
    data: [
      { answer: "he is a teacher", question: "അവൻ ഒരു അദ്ധ്യാപകനാണ്." },
      {
        answer: "what is his job,what does he do for a living",
        question: "അവന്റെ ജോലി എന്താണ്?",
      },
      { answer: "where is he going", question: "അവൻ എങ്ങോട്ടാണ് പോവുന്നത്?" },
      {
        answer: "did you go to school yesterday",
        question: "നീ ഇന്നലെ സ്കൂളിൽ പോയോ?",
      },
      { answer: "he studies well", question: "അവൻ നന്നായിട്ട്  പഠിക്കും." },
      {
        answer: "i was not here when she came",
        question: "അവൾ  വന്നപ്പോൾ ഞാൻ ഇവിടെ ഉണ്ടായിരുന്നില്ല.",
      },
      {
        answer: "i have never been to kochi,i have never visited kochi",
        question: "ഞാൻ  ഇതുവരെ കൊച്ചിയിൽ പോയിട്ടില്ല.",
      },
      {
        answer: "my brother and i are studying in the same school",
        questions: "ഞാനും എന്റെ  സഹോദരനും ഒരു  സ്കൂളിലാണ്  പഠിക്കുന്നത്.",
      },
      {
        answer: "ammu was taken to home yesterday",
        questions: "ഇന്നലെ അമ്മുവിനെ വീട്ടില് കൊണ്ടുപോയി.",
      },
      {
        answer: "what number of your birthday is this",
        questions: "ഇന്നലെ അമ്മുവിനെ വീട്ടില് കൊണ്ടുപോയി.",
      },
    ],
  });
};
exports.addMark = async (req, res, next) => {
  const mark = req.body.score;
  var answers = "";
  if (req.body.answers) answers = req.body.answers;
  const phone = req.body.phone;
  let level = "entry";
  const score = (mark.match(new RegExp("1", "g")) || []).length;

  if (score == 10) level = "advanced";
  else if (score > 7) level = "secondary";

  User.update(
    {
      phone: phone,
    },
    {
      $set: {
        marks: mark,
        answers: answers,
        level: level,
        amount: this.getAmount(level),
      },
    },
    { upsert: false },
    async function (err) {
      if (err) {
        console.log(err, this.getAmount(level));
        return res.status(500).json({
          status: false,

          message: "Error adding mark",
          error: err,
        });
      }
      let user = await User.findOne({
        phone: phone,
      });
      return res.status(200).json({
        status: true,
        data: user,
        message: "Mark updates succesfully",
      });
    }
  );
};
exports.update = async (req, res, next) => {
  let user = {};
  if (req.body.name) user.name = req.body.name;
  if (req.body.isAdmited != null) {
    user.isAdmited = req.body.isAdmited;
    user.admited_at = moment().add(5, "hours").add(30, "minutes");
  }
  if (req.body.days != null) user.days = req.body.days;
  if (req.body.tutor != null) user.tutor = req.body.tutor;
  if (req.body.has_referral != null) user.has_referral = req.body.has_referral;
  if (req.body.fcmToken != null) user.fcmToken = req.body.fcmToken;
  if (req.body.amount) user.amount = req.body.amount;

  if (
    req.body.level != null &&
    ["entry", "advanced", "secondary"].includes(req.body.level.toLowerCase())
  ) {
    user.level = req.body.level.toLowerCase();
    user.amount =
      req.body.amount ?? this.getAmount(req.body.level.toLowerCase());
  }
  const phone = req.params.phone;

  if (req.files && req.files["avatar"]) {
    user.avatar = req.files["avatar"][0]["location"];
  }

  if (req.body.review || req.body.receipt) {
    if (req.body.receipt) {
      console.log(req.body.receipt.transaction_id);
      const duplicateData = await User.findOne({
        receipt: {
          $elemMatch: { transaction_id: req.body.receipt.transaction_id },
        },
      });
      if (duplicateData)
        return res.status(500).json({
          status: false,
          message: "Invalid Transaction ID",
        });
    }

    User.findOneAndUpdate(
      {
        phone: phone,
      },
      {
        $addToSet: {
          ...(req.body.review && { review: req.body.review }),
          ...(req.body.receipt && { receipt: req.body.receipt }),
        },
      },
      { safe: true },
      async function (err, result) {
        if (err)
          return res.status(500).json({
            status: false,
            message: "Error Updating user",
            error: err,
          });

        let user = await User.findOne({
          phone: phone,
        });
        if (req.body.review)
          triggetNotification(
            {
              sender: req.headers.name,
              review: req.body.review.review,
              name: result.name,
            },
            NOTI_TYPE.ST_REVIEWD
          );
        return res.status(200).json({
          status: true,
          user: user,
          message: "User updated succesfully",
        });
      }
    );
    return;
  }
  if (req.body.receipt) user.receipt = req.body.receipt;

  User.update(
    {
      phone: phone,
    },
    { $set: user },
    { upsert: false },
    async function (err) {
      if (err)
        return res.status(500).json({
          status: false,

          message: "Error Updating user",
          error: err,
        });

      let user = await User.findOne({
        phone: phone,
      });
      return res.status(200).json({
        status: true,
        user: user,
        message: "User updated succesfully",
      });
    }
  );
};
exports.detail = async (req, res, next) => {
  User.findOne({ phone: req.params.phone })
    .then((result) => {
      res
        .status(200)
        .json({ status: true, data: result, message: "student detail" });
    })
    .catch(function (error) {
      res.status(500).json({ status: false, message: "failed" });
    });
};
exports.delete = async (req, res, next) => {
  User.deleteOne({ phone: req.params.phone })
    .then(function () {
      res.status(200).json({ status: true, message: "deleted" });
    })
    .catch(function (error) {
      res.status(500).json({ status: false, message: "deleted" });
    });
};
exports.deacticate = async (req, res, next) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });

    User.deleteOne({ phone: req.params.phone })
      .then(function () {
        try {
          const dUsr = new DeletedUser({
            _id: new mongoose.Types.ObjectId(),
            ...user.toJSON(),
          });
          dUsr.save();
        } catch (error) {}
        return res.status(200).json({ status: true, message: "deleted" });
      })
      .catch(function (error) {
        res.status(500).json({ status: false, message: "deleted" });
      });
  } catch (error) {
    res.status(500).json({ status: false, message: "deleted" });
  }
};

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
const getWhatsAppNumber = async () => {
  const rows = [
    919288005753, 919288007871, 918891023485, 918891180832, 919288007872,
    919288005756, 919288005758, 919288005710, 919288005712,
  ];
  try {
    const numbers = await phone.find();

    return `${numbers[randomIntFromInterval(0, numbers.length - 1)]["number"]}`;
  } catch (error) {
    console.log(error);
    return `+${rows[randomIntFromInterval(0, rows.length - 1)]}`;
  }

  // console.log(rows[1].name);

  // rows.forEach(e=> e.)

  // read rows

  // // read/write row values
  // console.log(rows[0].name); // 'Larry Page'
};

// getWhatsAppNumber();
exports.check_user = async (req, res, next) => {
  User.findOne({
    phone: req.body.phone,
  })
    .exec()
    .then((user) => {
      if (user != null) {
        return res.status(200).json({ status: true, message: "User Exist" });
      } else {
        return res
          .status(200)
          .json({ status: false, message: "User not registered" });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(200).json({ status: false, message: "error" });
    });
};
exports.notifications = async (req, res, next) => {
  User.findOne({
    phone: req.body.phone,
  })
    .exec()
    .then(async (user) => {
      if (user != null) {
        // Convert string dates to Date objects and format them
        const joinedDate = new Date(user.created_at);
        // joinedDate.setHours(
        //   joinedDate.getHours() + 5,
        //   joinedDate.getMinutes() + 30
        // );
        const admittedDate = new Date(user.admited_at);

        // Determine the total marks based on the user's level
        const totalMarks =
          user.level === "basic" || user.level === "entry"
            ? "Entry"
            : user.level === "advanced"
            ? "Advanced"
            : "Secondary";

        // Initialize an array to store notifications
        const notifications = [];

        // Add the welcome notification
        notifications.push({
          title: "Welcome to Kenme",
          description:
            "At Kenme, we focus on helping out students who find it difficult to take out time from their daily schedule for learning, but still have a passion for it",
          date: moment(joinedDate).format("MMM DD, yyyy, hh:mm A"),
        });

        console.log(user, "user");
        // Check if the user is admitted and add the level notification
        if (user.isAdmited || user.admited_at) {
          notifications.push({
            title: `${totalMarks} Level`,
            description: `You are selected as ${totalMarks} Level`,
            date: moment(admittedDate).format("MMM DD, yyyy, hh:mm A"),
          });
        }
        return res.status(200).json({
          status: true,
          data: notifications,
        });
      } else {
        return res.status(200).json({
          status: true,
          data: [],
        });
      }
    });
};
const MAX_CLASS_DURATION = 60;
exports.user_login = async (req, res, next) => {
  // await User.remove({});
  // User.find().then((ee) => console.log(ee));
  User.findOne({
    phone: req.body.phone,
  })
    .exec()
    .then(async (user) => {
      if (user != null) {
        console.log(req.headers);
        console.log(req.headers.deviceid, user.device_id, "devic check");

        if (req.headers.deviceid && user.device_id !== req.headers.deviceid) {
          return res.status(500).json({
            status: false,
            message: "The device is not registered with our database",
          });
        }

        let no = await getWhatsAppNumber();
        let tutor_detail = null;
        try {
          tutor_detail = await Officials.findOne({ _id: user.tutor });
        } catch (error) {}

        if (req.body.device_id) {
          await User.update(
            { phone: req.body.phone },
            {
              $set: {
                device_id: req.body.device_id,
              },
            },
            { upsert: true }
          );
        }

        // attende days
        const clientTimezoneOffset = new Date().getTimezoneOffset();
        const lastMidnight = new Date(
          Date.now() + clientTimezoneOffset * 60 * 1000
        );
        lastMidnight.setHours(0, 0, 0, 0);

        const userAdmissionDate = moment(user.admited_at, moment.ISO_8601);
        const userBatchDate = moment(user.batch_date, moment.ISO_8601);

        // Get today's date
        const today = moment();

        let attendedDays;

        if (userBatchDate.isBefore(userAdmissionDate)) {
          // If the userBatchDate is later than the admission date
          attendedDays = today.diff(userBatchDate, "days");
        } else {
          // If the userBatchDate is earlier or equal to the admission date
          attendedDays = today.diff(userAdmissionDate, "days");
        }

        console.log(attendedDays, userBatchDate, userAdmissionDate);

        attendedDays =
          attendedDays > MAX_CLASS_DURATION ? MAX_CLASS_DURATION : attendedDays;
        const totalPaidAmount = user.receipt.reduce(
          (total, receipt) => total + receipt.amount,
          0
        );

        // Determine the allotted days based on the conditions
        let allottedDays = 0;
        if (user.isAdmited && user.batch_date) {
          if (totalPaidAmount >= user.amount) {
            allottedDays = MAX_CLASS_DURATION; // If the amount is equal or greater than the total amount
          } else if (totalPaidAmount >= user.amount / 2) {
            allottedDays = 30; // If half of the amount is paid
          } else if (totalPaidAmount >= user.amount / 4) {
            allottedDays = 15; // If a quarter of the amount is paid
          }
        }

        const fUser = user.toJSON();
        return res.status(200).json({
          status: true,
          data: {
            sender_no: no,
            tutor_details: tutor_detail,
            exam_attended: fUser.marks || fUser.level ? true : false,
            marks: fUser.marks,
            user: {
              ...fUser,
              attendedDays: attendedDays,
              level: fUser.level === "entry" ? "basic" : fUser.level,
              admited_at: fUser.batch_date || fUser.admited_at,
            },
            class_details: {
              attendedDays: attendedDays,
              totalPaidAmount: totalPaidAmount,
              total_class: MAX_CLASS_DURATION,
              alloted_days: allottedDays,
              unlocked_days: attendedDays,
            },
            course: {
              attendedDays: attendedDays,
              level: fUser.level === "entry" ? "basic" : fUser.level,
              admited_at: fUser.batch_date || fUser.admited_at,
            },
          },

          message: "User Details",
        });
      } else {
        return res
          .status(200)
          .json({ status: false, message: "User not registered" });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(200).json({ status: false, message: "error" });
    });
};

function remove_duplicates_es6(arr) {
  let s = new Set(arr);
  let it = s.values();
  return Array.from(it);
}

exports.getAllStudent = async (req, res, next) => {
  try {
    var query = "";

    if (req.body.search != null) query = req.body.search;

    let users = [];

    let count = 0;

    let aggregates = [
      {
        $lookup: {
          from: "officials",
          localField: "tutor",
          foreignField: "_id",
          as: "tutor",
        },
      },
      { $unwind: { path: "$tutor", preserveNullAndEmptyArrays: true } },
      { $addFields: { amountPaid: { $sum: "$receipt.amount" } } },
      { $sort: { created_at: -1 } },
    ];

    if (req.body.tutor) {
      aggregates.push({ $match: { tutor: { $ne: null } } });

      aggregates.push({
        $match: { "tutor._id": new ObjectId(req.body.tutor) },
      });
    }
    if (query && query.length > 3) {
      aggregates.push({
        $match: {
          $or: [
            {
              phone: {
                $regex: new RegExp(query, "i"),
              },
            },
            {
              name: {
                $regex: new RegExp(query, "i"),
              },
            },
          ],
        },
      });
    }

    if (req.body.isAdmited != null)
      aggregates.push({ $match: { isAdmited: req.body.isAdmited } });
    if (req.body.admited_by)
      aggregates.push({ $match: { admited_by: req.body.admited_by } });

    if (req.body.batch_date)
      aggregates.push({
        $match: {
          batch_date: req.body.batch_date,
        },
      });

    if (req.body.paymentStatus === "fp")
      aggregates.push({
        $match: {
          $expr: {
            $eq: ["$amount", "$amountPaid"],
          },
        },
        $match: {
          has_referral: false,
        },
      });
    if (req.body.paymentStatus === "fmp") {
      aggregates.push({
        // $match: {
        //   $expr: {
        //     $eq: ["$amount", "$amountPaid"],
        //   },
        // },
        $match: {
          has_referral: true,
        },
      });
    }

    if (req.body.paymentStatus === "pp")
      aggregates = [
        ...aggregates,
        ...[
          {
            $match: { amountPaid: { $gt: 0 } },
          },
          {
            $match: {
              $expr: {
                $gte: ["$amountPaid", "$amount/2"],
              },
            },
          },
          {
            $match: {
              $expr: {
                $ne: ["$amount", "$amountPaid"],
              },
            },
          },
        ],
      ];
    if (req.body.paymentStatus === "ppf")
      aggregates = [
        ...aggregates,
        ...[
          {
            $match: { amountPaid: { $gt: 0 } },
          },
          {
            $match: {
              $expr: {
                $gte: ["$amountPaid", "$amount/2"],
              },
            },
          },
        ],
      ];

    if (req.body.payed_by) {
      aggregates.push({
        $match: {
          "receipt.payed_by": new ObjectId(req.body.payed_by),
        },
      });
      aggregates.push({
        $addFields: {
          receipt: {
            $filter: {
              input: "$receipt",
              as: "receipt",
              cond: {
                $eq: ["$$receipt.payed_by", new ObjectId(req.body.payed_by)],
              },
            },
          },
        },
      });
    }

    users = await User.aggregate(aggregates)
      .skip(req.body.start_index)
      .limit(req.body.records_count);

    count = await User.estimatedDocumentCount({
      $or: [
        { name: new RegExp(query, "i") },
        { phone: new RegExp(query, "i") },
      ],
    });

    return res.status(200).json({
      status: true,
      count: count,
      record_count: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      status: error,
      message: "fetching failed",
    });
  }
};

exports.getActivatedStudents = async (req, res, next) => {
  try {
    var query = "";

    if (req.body.search != null) query = req.body.search;

    let users = [];

    let count = 0;
    var filters = { isAdmited: true };
    if (req.body.days) filters.days = req.body.days;
    if (!query && query.length < 3) {
      users = await User.find(filters)
        .skip(req.body.start_index)
        .limit(req.body.records_count)
        .sort({ created_at: -1 });

      count = await User.count(filters);
    } else {
      users = await User.find({
        $or: [
          { name: new RegExp(query, "i") },
          { phone: new RegExp(query, "i") },
        ],
        ...filters,
      })
        .skip(req.body.start_index)
        .limit(req.body.records_count)
        .sort({ created_at: -1 });

      count = await User.count({
        $or: [
          { name: new RegExp(query, "i") },
          { phone: new RegExp(query, "i") },
        ],
        ...filters,
      });
    }

    return res.status(200).json({
      status: true,
      count: count,
      record_count: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      status: error,
      message: "fetching failed",
    });
  }
};
exports.user_signup = async (req, res, next) => {
  if (!get(req, "body.email")) {
    return res.status(200).json({
      status: false,
      message: "Please Give Email ID for registeration",
    });
  }
  if (!get(req, "body.phone")) {
    return res
      .status(200)
      .json({ status: false, message: "Please Give Mobile for registeration" });
  }
  if (!get(req, "body.name")) {
    return res
      .status(200)
      .json({ status: false, message: "Please Give Names for registeration" });
  }

  var bool = await User.findOne({
    phone: req.body.phone,
  });
  if (bool != null) {
    return res.status(200).json({
      status: false,
      message: "User already registered please login",
      bool,
    });
  }
  let data = {
    _id: new mongoose.Types.ObjectId(),
    email: req.body.email,
    name: req.body.name,
    phone: req.body.phone,
    place: req.body.place,
    gender: req.body.gender,
    age: req.body.age,
  };
  if (req.body.level) {
    data.level = req.body.level.toLowerCase();
    if (data.level == "basic") {
      data.level = "entry";
    }
    data.amount = this.getAmount(req.body.level.toLowerCase());
  }

  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    email: req.body.email,
    name: req.body.name,
    phone: req.body.phone,
    place: req.body.place,
    gender: req.body.gender,
    age: req.body.age,
    created_at: moment(),
    admited_at: moment(),
  });
  user
    .save()
    .then(async (result) => {
      try {
        let number = await getWhatsAppNumber();
        let response = {
          status: true,
          data: { ...result.toJSON(), sender_no: number },
        };
        response.data.sender_no = number;
        return res.status(200).json(response);
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          status: false,
          message: "Failed to register",
          error: error,
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

exports.getAmount = (level) => {
  if (level.toLowerCase() == "entry") return 3500 - 500;
  if (level.toLowerCase() == "secondary") return 4000 - 500;
  if (level.toLowerCase() == "advanced") return 4500 - 500;

  return false;
};
exports.super_signup = async (req, res, next) => {
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
      .json({ status: false, message: "User already registered please login" });
  }
  var data = {
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    age: req.body.age,
    gender: req.body.gender,
    isAdmited: req.body.isAdmited ?? false,
    days: req.body.days,
    place: req.body.place,
    tutor: req.body.tutor,
    created_at: moment(),
    admited_at: moment(),
  };

  if (req.body.level) {
    data.level = req.body.level.toLowerCase();

    if (data.level === "advanced") data.marks = "10";
    else if (data.level === "secondary") data.marks = "8";
    else {
      data.marks = "5";
      data.level = "entry";
    }
  }

  const user = new User(data);
  user
    .save()
    .then(async (result) => {
      try {
        let number = await getWhatsAppNumber();
        return res.status(200).json({
          status: true,
          sender_no: number,
          data: result,
        });
      } catch (error) {
        console.log(error);
        return res.status(200).json({
          status: false,
        });
      }
    })
    .catch((err) => {
      return res.status(202).json({
        status: false,
        message: `Registeration saving Error -> ${err}`,
      });
    });
};

function sentToken(res, user) {
  var token = new Token({
    user_id: user._id,
    token: Math.floor(100000 + Math.random() * 900000),
  });
  token.save(function (err) {
    if (err) {
      return res.status(202).json(SuccessErr(null, "sent Email failed"));
    }

    var mailOptions = {
      from: "support@myself.social",
      to: user.email,
      subject: "Myself Social Account Reset",
      text:
        "Hello,\n\n" +
        "Please verify your account. \nThe verfication code is " +
        token.token +
        ".\n",
    };
    transporter.sendMail(mailOptions, function (err) {
      if (err) {
        return res
          .status(202)
          .json(
            SuccessErr(null, `Mail Service Error -> ${get(err, "message")}`)
          );
      }
      return res.status(200).send(
        SuccessErr({
          message: "A verification email has been sent to " + user.email + ".",
        })
      );
    });
  });
}

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: "support@myself.social",
    pass: "myself@2020",
  },
  tls: {
    ciphers: "SSLv3",
  },
  requireTLS: true,
});

// ENGLISH CAFe

exports.is_registerd = async (req, res, next) => {};
