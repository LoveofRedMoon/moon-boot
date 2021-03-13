import nodeSchedule, {
  Job,
  RecurrenceRule,
  RecurrenceSpecDateRange,
  RecurrenceSpecObjLit,
} from 'node-schedule'
const jobMapper = new Map<string | symbol, Job>()
export type ScheduleRule =
  | RecurrenceRule
  | RecurrenceSpecDateRange
  | RecurrenceSpecObjLit
  | Date
  | string
  | number
export function Schedule(rule: ScheduleRule): MethodDecorator
export function Schedule(name: string, rule: ScheduleRule): MethodDecorator
export function Schedule(
  name: ScheduleRule,
  rule?: ScheduleRule
): MethodDecorator {
  return function (this: any, target, key, desc) {
    const n = rule === void 0 ? Symbol() : (name as string)
    const r = rule === void 0 ? name : rule
    jobMapper.set(
      n,
      nodeSchedule.scheduleJob(r, function () {
        ;(desc.value as any).call(target)
      })
    )
  }
}
export function cancelJob(name: string, reschedule?: boolean | undefined) {
  return jobMapper.get(name)?.cancel(reschedule)
}

export function cancelNext(name: string, reschedule?: boolean | undefined) {
  return jobMapper.get(name)?.cancelNext(reschedule)
}

export function reschedule(
  name: string,
  spec: string | number | RecurrenceRule
) {
  return jobMapper.get(name)?.reschedule(spec)
}

export function nextInvocation(name: string) {
  return jobMapper.get(name)?.nextInvocation()
}
