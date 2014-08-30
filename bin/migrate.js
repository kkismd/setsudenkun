db.icons.ensureIndex({timestamp: 1}, {expireAfterSeconds: 60*60});
db.rooms.ensureIndex({roomId: 1}, {unique: true});
