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
  muted: boolean
}

export interface Config {
  endpoint: string
  token: string
  muteInterval: number
  rules: PushRelation[]
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    endpoint: Schema.string().description('Webhook Endpoint').default('/plugins/forgejo/webhook'),
    token: Schema.string().description('Webhook Token'),
  }).description('基础配置'),
  Schema.object({
    muteInterval: Schema.number().description('静音时长').default(600000),
  }).description('推送配置'),
  Schema.object({
    rules: Schema.array(Schema.object({
      scope: Schema.string().description('推送范围'),
      target: Schema.array(Schema.object({
        platform: Schema.string().description('目标平台'),
        channel: Schema.string().description('目标频道'),
        muted: Schema.boolean().description('是否静音').default(false).hidden(true),
      })),
      enabled: Schema.boolean().description('是否启用').default(true),
    })),
  }).description('推送规则'),
])

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger(name)
  
  ctx.server.post(config.endpoint, async (c, next) => {
    if (c.request.headers['authorization'] !== config.token) {
      c.status = 401
      logger.warn("收到来自 %s 的未授权请求", c.request.ip)
      return c.body = 'Unauthorized'
    }
    const event = c.request.body as e.Event
    const event_type = c.request.headers['x-forgejo-event-type']
    const event_from = event.repository.full_name
    for (const rule of config.rules) {
      if (event_from.startsWith(rule.scope) && rule.enabled) {
        for (const target of rule.target) {
          if (target.muted) {
            logger.info("%s 的推送已暂停，跳过", target.channel)
            continue
          }
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
    logger.info("收到并完成来自 %s 的推送", event_from)
    c.status = 200
    return c.body = 'OK'
  }, 
  )
  
  ctx.command('fj.mute [...channels]', '静音指定频道', { authority: 2 })
    .action(async ({ session }, ...channels) => {
      if (channels.length === 0) {
        channels = [session.channelId]
      }
      for (const rule of config.rules) {
        for (const target of rule.target) {
          if (channels.includes(target.channel)) {
            target.muted = true
          }
        }
      }
      const minutes = Math.floor(config.muteInterval / 60000)
      session.send(`推送已暂停，${minutes}分钟后自动恢复`)
      
      setTimeout(() => {
        for (const rule of config.rules) {
          for (const target of rule.target) {
            if (channels.includes(target.channel)) {
              target.muted = false
            }
          }
        }
      }, config.muteInterval)
    })

  ctx.command('fj.unmute [...channels]', '取消静音指定频道', { authority: 2 })
    .action(async ({ session }, ...channels) => {
      if (channels.length === 0) {
        channels = [session.channelId]
      }
      for (const rule of config.rules) {
        for (const target of rule.target) {
          if (channels.includes(target.channel)) {
            target.muted = false
          }
        }
      }
      session.send('推送已恢复')
    })
}
