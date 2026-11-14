import mongoose, { Schema } from 'mongoose';
import schemaOptions from './helpers/schemaOptions.js';

/** What a daily total counts. */
export const STAT_KINDS = ['page', 'visit', 'source'];

/** Totals are kept for about 13 months, then removed by MongoDB. */
const RETENTION_SECONDS = 400 * 24 * 60 * 60;

/**
 * One daily total for visitor analytics: page views of one path, visits, or
 * visits from one source domain. Only totals are stored, never individual
 * visits, so nothing here identifies a visitor.
 *
 * `date` is midnight UTC of the calendar day in the analytics time zone (see
 * services/analyticsService.js), so a day's totals share one value.
 */
const dailyStatSchema = new Schema(
  {
    date: { type: Date, required: true },
    kind: { type: String, required: true, enum: STAT_KINDS },
    // Page path, source domain, or "all" for visits.
    key: { type: String, required: true, trim: true, maxlength: 200 },
    count: { type: Number, default: 0, min: 0 },
  },
  schemaOptions,
);

dailyStatSchema.index({ date: 1, kind: 1, key: 1 }, { unique: true });
dailyStatSchema.index({ date: 1 }, { expireAfterSeconds: RETENTION_SECONDS });

const DailyStat = mongoose.models.DailyStat || mongoose.model('DailyStat', dailyStatSchema);
export default DailyStat;
