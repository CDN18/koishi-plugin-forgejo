import { Context, Schema } from 'koishi'
import * as e from './events'
import { ConstructMessage } from './msg'
import {} from '@koishijs/plugin-server'
import {} from '@koishijs/plugin-notifier'
import { platform } from 'os'

export const name = 'forgejo'

export const inject = ['server']
export const usage = `
让Koishi支持接收Forgejo的Webhook推送，并转发到指定的平台。

必须在全局设置中配置可用的SelfUrl，并确保Forgejo实例可以访问到Koishi实例。
`

export interface PushRelation {
  scope: string
  target: Target[]
  enabled: boolean
}
export interface Target {
  platform: string
  channel: string
}

export interface Config {
  endpoint: string
  token: string
  rules: PushRelation[]
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    endpoint: Schema.string().description('Webhook Endpoint').default('/plugins/forgejo/webhook'),
    token: Schema.string().description('Webhook Token'),
  }).description('基础配置'),
  Schema.object({
    rules: Schema.array(Schema.object({
      scope: Schema.string().description('推送范围'),
      target: Schema.array(Schema.object({
        platform: Schema.string().description('目标平台'),
        channel: Schema.string().description('目标频道'),
      })),
      enabled: Schema.boolean().description('是否启用').default(true),
    })),
  }).description('推送规则'),
])

export function apply(ctx: Context, config: Config) {
  // write your plugin here
  const logger = ctx.logger(name)
  
  ctx.server.post(config.endpoint, async (c, next) => {
    if (c.request.headers['Authorization'] !== config.token) {
      c.status = 401
      return c.body = 'Unauthorized'
    }
    const event = c.request.body as e.Event
    const event_type = c.request.headers['x-forgejo-event-type']
    const event_from = event.repository.full_name
    for (const rule of config.rules) {
      if (event_from.startsWith(rule.scope) && rule.enabled) {
        for (const target of rule.target) {
          const message = ConstructMessage(
            event, typeof event_type === 'string' ? event_type : event_type[0]
          )
          for (const bot of ctx.bots) {
            if (bot.platform === target.platform) {
              await bot.sendMessage(target.channel, message)
            }
          }
        }
      }
    }
    c.status = 200
    return c.body = 'OK'
  }, 
  )
}
