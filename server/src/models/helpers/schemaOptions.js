/**
 * Options shared by every schema:
 * - createdAt / updatedAt timestamps
 * - JSON output with `id` instead of `_id` and without the internal `__v` key
 */
const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      delete ret._id;
      return ret;
    },
  },
};

export default schemaOptions;
