import { Bot } from "koishi"
import * as e from './events'
import { transform } from 'koishi-plugin-markdown'

export function ConstructMessage(event: e.Event, event_type: string) {
    let message = ''
    // 优先使用 full name，如果full name为空，fallback到login
    const sender = event.sender.full_name || event.sender.login
    switch (event_type) {
        case 'repository':
            switch (event.action) {
                case 'created':
                    message += `${sender} 创建了存储库 ${event.repository.full_name}`
                    break
                case 'deleted':
                    message += `${sender} 删除了存储库 ${event.repository.full_name}`
                    break
                case 'archived':
                    message += `${sender} 将存储库 ${event.repository.full_name} 转为归档状态`
                    break
                case 'unarchived':
                    message += `${sender} 将存储库 ${event.repository.full_name} 从归档状态恢复`
                    break
                case 'publicized':
                    message += `${sender} 将存储库 ${event.repository.full_name} 设为公开`
                    break
                case 'privatized':
                    message += `${sender} 将存储库 ${event.repository.full_name} 设为私有`
                    break
                default:
                    message += `${sender} 对存储库 ${event.repository.full_name} 进行了未知操作 ${event.action}                        `
                    break
            }
            if (event.action !== 'deleted') {
                message += `\n${event.repository.html_url}`
            }
            break
        case 'create':
            switch (event.ref_type) {
                case 'branch':
                    // remove the 'refs/heads/' prefix
                    const branch_name = event.ref.slice(11)
                    message += `${sender} 在存储库 ${event.repository.full_name} 创建了分支 ${branch_name}\n${event.repository.html_url}/src/branch/${branch_name}`
                    break
                case 'tag':
                    // remove the 'refs/tags/' prefix
                    const tag_name = event.ref.slice(10)
                    message += `${sender} 在存储库 ${event.repository.full_name} 创建了标签 ${tag_name}\n${event.repository.html_url}/releases/tag/${tag_name}`
                    break
                default:
                    message += `${sender} 在存储库 ${event.repository.full_name} 创建了未知类型的引用 ${event.ref_type}`
                    break
            }
            break
        case 'delete':
            switch (event.ref_type) {
                case 'branch':
                    // remove the 'refs/heads/' prefix
                    const branch_name = event.ref.slice(11)
                    message += `${sender} 在存储库 ${event.repository.full_name} 删除了分支 ${branch_name}`
                    break
                case 'tag':
                    // remove the 'refs/tags/' prefix
                    const tag_name = event.ref.slice(10)
                    message += `${sender} 在存储库 ${event.repository.full_name} 删除了标签 ${tag_name}`
                    break
                default:
                    message += `${sender} 在存储库 ${event.repository.full_name} 删除了未知类型的引用 ${event.ref_type}`
                    break
            }
            break
        case 'push':
            const sha_before_short = event.before.slice(0, 7)
            const sha_short = event.after.slice(0, 7)
            message = `
                ${sender} 向存储库 ${event.repository.full_name} 推送了 ${event.total_commits} 个提交\n从 ${sha_before_short} 到 ${sha_short}。\n最新提交： ${event.head_commit.message}\n添加 ${event.head_commit.added.length} 个文件，修改 ${event.head_commit.modified.length} 个文件，删除 ${event.head_commit.removed.length} 个文件。\n${event.compare_url}
                `
            break
        case 'release':
            const release_name = event.release.name || event.release.tag_name
            const release_body_md = transform(event.release.body)
            const release_type = event.release.prerelease ? '预发布' : '正式发布'
            switch (event.action) {
                case 'published':
                    message = `${sender} 在存储库 ${event.repository.full_name} 发布了版本 ${release_name} (${release_type})\n发行说明：\n${release_body_md}`
                    break
                case 'updated':
                    message = `${sender} 在存储库 ${event.repository.full_name} 更新了已发布的版本 ${release_name} (${release_type})\n发行说明：\n${release_body_md}`
                    break
                case 'deleted':
                    message = `${sender} 在存储库 ${event.repository.full_name} 删除了已发布的版本 ${release_name} (${release_type})`
                    break
                default:
                    message = `${sender} 对存储库 ${event.repository.full_name} 的版本 ${release_name} (${release_type}) 进行了未知操作 ${event.action}`
                    break
            }
            if (event.action !== 'deleted') {
                message += `\n${event.release.html_url}`
            }
            break
        case 'wiki':
            switch (event.action) {
                case 'created':
                    message = `${sender} 在存储库 ${event.repository.full_name} 创建了Wiki页面 ${event.page}\n创建说明： ${event.comment}`
                    break
                case 'edited':
                    message = `${sender} 在存储库 ${event.repository.full_name} 编辑了Wiki页面 ${event.page}\n编辑说明： ${event.comment}`
                    break
                case 'renamed':
                    message = `${sender} 在存储库 ${event.repository.full_name} 重命名Wiki页面到 ${event.page}`
                    break
                case 'removed':
                    message = `${sender} 在存储库 ${event.repository.full_name} 删除了Wiki页面 ${event.page}`
                    break
                default:
                    message = `${sender} 对存储库 ${event.repository.full_name} 的Wiki页面 ${event.page} 进行了未知操作 ${event.action}`
                    break
            }
            if (event.action !== 'removed') {
                message += `\n${event.repository.html_url}/wiki/${event.page}`
            }
            break
        case 'issues':
            const issue_content = transform(event.issue.body)
            switch (event.action) {
                case 'opened':
                    message = `${sender} 创建了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title}\n工单内容：\n${issue_content}`
                    break
                case 'edited':
                    message = `${sender} 编辑了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title}\n工单内容：\n${issue_content}`
                    break
                case 'deleted':
                    message = `${sender} 删除了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title}`
                    break
                case 'closed':
                    message = `${sender} 关闭了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title}`
                    break
                case 'reopened':
                    message = `${sender} 重新打开了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title}`
                    break
                default:
                    message = `${sender} 对工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title} 进行了未知操作 ${event.action}`
                    break
            }
            if (event.action !== 'deleted') {
                message += `\n${event.issue.html_url}`
            }
            break
        case 'issue_assign':
            switch (event.action) {
                case 'assigned':
                    // const assigner = event.issue.assignee.full_name || event.issue.assignee.login
                    let assignee = ''
                    for (const a of event.issue.assignees) {
                        assignee += a.full_name || a.login
                        assignee += ', '
                    }
                    // remove the trailing ', '
                    assignee = assignee.slice(0, -2)
                    message = `${sender} 编辑了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title}\n将该工单分配给： ${assignee}`
                    break
                case 'unassigned':
                    message = `${sender} 编辑了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title}\n取消了该工单的部分或全部分配。`
                    break
                default:
                    message = `${sender} 对工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title} 进行了未知操作 ${event.action}`
                    break
            }
            message += `\n${event.issue.html_url}`
            break
        case 'issue_label':
            let issue_label_names = ''
            for (const l of event.issue.labels) {
                issue_label_names += l.name
                issue_label_names += ', '
            }
            // remove the trailing ', '
            issue_label_names = issue_label_names.slice(0, -2)
            message = `
                ${sender} 编辑了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title}\n更新了工单的标签。目前标签：${issue_label_names}\n${event.issue.html_url}
                `
            break
        case 'issue_milestone':
            const issue_milestone_total_issues = event.issue.milestone.open_issues + event.issue.milestone.closed_issues
            switch (event.action) {
                case 'milestoned':
                    message = `${sender} 编辑了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title}\n将该工单加入了里程碑 ${event.issue.milestone.title}，里程碑目前进度 ${event.issue.milestone.closed_issues}/${issue_milestone_total_issues}\n工单地址： ${event.issue.html_url}\n里程碑地址： ${event.repository.html_url}/milestone/${event.issue.milestone.id}`
                    break
                case 'demilestoned':
                    message = `${sender} 编辑了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title}\n将该工单移出了里程碑 ${event.issue.milestone.title}，里程碑目前进度 ${event.issue.milestone.closed_issues}/${issue_milestone_total_issues}\n${event.issue.html_url}`
                    break
                default:
                    message = `${sender} 对工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title} 进行了未知操作 ${event.action}\n${event.issue.html_url}`
                    break
            }
            break
        case 'issue_comment':
            const comment_content = transform(typeof event.comment === 'string' ? event.comment : event.comment.body)
            const comment_username = typeof event.comment === 'string' ? sender : (
                event.comment.user.full_name || event.comment.user.login
            )
            const comment_url = typeof event.comment === 'string' ? event.issue.html_url : event.comment.html_url
            switch (event.action) {
                case 'created':
                    message = `${comment_username} 评论了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title}\n评论内容：\n${comment_content}`
                    break
                case 'edited':
                    message = `${comment_username} 编辑了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title} 的评论\n评论内容：\n${comment_content}`
                    break
                case 'deleted':
                    message = `${comment_username} 删除了工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title} 的评论`
                    break
                default:
                    message = `${comment_username} 对工单 ${event.repository.full_name}#${event.issue.number}: ${event.issue.title} 进行了未知操作 ${event.action}`
                    break
            }
            if (event.action !== 'deleted') {
                message += `\n${comment_url}`
            }
            break
        case 'pull_request':
            const pr_content = transform(event.pull_request.body)
            switch (event.action) {
                case 'opened':
                    message = `${sender} 创建了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n该合并请求会将 ${event.pull_request.head.label} 合并到 ${event.pull_request.base.label}\n合并请求描述：\n${pr_content}`
                    break
                case 'edited':
                    message = `${sender} 编辑了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n该合并请求会将 ${event.pull_request.head.label} 合并到 ${event.pull_request.base.label}\n合并请求描述：\n${pr_content}`
                    break
                case 'closed':
                    const pr_merged = event.pull_request.merged ? '已被合并' : '未被合并'
                    message = `${sender} 关闭了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n该合并请求${pr_merged}`
                    break
                case 'reopened':
                    message = `${sender} 重新打开了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n该合并请求会将 ${event.pull_request.head.label} 合并到 ${event.pull_request.base.label}\n合并请求描述：\n${pr_content}`
                    break
                default:
                    message = `${sender} 对合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title} 进行了未知操作 ${event.action}`
                    break
            }
            message += `\n${event.pull_request.html_url}`
            break
        case 'pull_request_assign':
            switch (event.action) {
                case 'assigned':
                    let assignee = ''
                    for (const a of event.pull_request.assignees) {
                        assignee += a.full_name || a.login
                        assignee += ', '
                    }
                    // remove the trailing ', '
                    assignee = assignee.slice(0, -2)
                    message = `${sender} 编辑了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n将该合并请求分配给： ${assignee}`
                    break
                case 'unassigned':
                    message = `${sender} 编辑了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n取消了该合并请求的分配。`
                    break
                default:
                    message = `${sender} 对合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title} 进行了未知操作 ${event.action}`
                    break
            }
            message += `\n${event.pull_request.html_url}`
            break
        case 'pull_request_label':
            let pr_label_names = ''
            for (const l of event.pull_request.labels) {
                pr_label_names += l.name
                pr_label_names += ', '
            }
            // remove the trailing ', '
            pr_label_names = pr_label_names.slice(0, -2)
            message = `
                ${sender} 编辑了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n更新了合并请求的标签。目前标签：${pr_label_names}\n${event.pull_request.html_url}
                `
            break
        case 'pull_request_milestone':
            const pr_milestone_total_issues = event.pull_request.milestone.open_issues + event.pull_request.milestone.closed_issues
            switch (event.action) {
                case 'milestoned':
                    message = `${sender} 编辑了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n将该合并请求加入了里程碑 ${event.pull_request.milestone.title}，里程碑目前进度 ${event.pull_request.milestone.closed_issues}/${pr_milestone_total_issues}\n合并请求地址： ${event.pull_request.html_url}\n里程碑地址： ${event.repository.html_url}/milestone/${event.pull_request.milestone.id}`
                    break
                case 'demilestoned':
                    message = `${sender} 编辑了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n将该合并请求移出了里程碑 ${event.pull_request.milestone.title}，里程碑目前进度 ${event.pull_request.milestone.closed_issues}/${pr_milestone_total_issues}\n${event.pull_request.html_url}`
                    break
                default:
                    message = `${sender} 对合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title} 进行了未知操作 ${event.action}\n${event.pull_request.html_url}`
                    break
            }
            break
        case 'pull_request_comment':
            const pr_comment_content = transform(typeof event.comment === 'string' ? event.comment : event.comment.body)
            const pr_comment_username = typeof event.comment === 'string' ? sender : (
                event.comment.user.full_name || event.comment.user.login
            )
            const pr_comment_url = typeof event.comment === 'string' ? event.pull_request.html_url : event.comment.html_url
            switch (event.action) {
                case 'created':
                    message = `${pr_comment_username} 评论了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n评论内容：\n${pr_comment_content}`
                    break
                case 'edited':
                    message = `${pr_comment_username} 编辑了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title} 的评论\n评论内容：\n${pr_comment_content}`
                    break
                case 'deleted':
                    message = `${pr_comment_username} 删除了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title} 的评论`
                    break
                default:
                    message = `${pr_comment_username} 对合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title} 进行了未知操作 ${event.action}`
                    break
            }
            if (event.action !== 'deleted') {
                message += `\n${pr_comment_url}`
            }
            break
        case 'pull_request_review_request':
            switch (event.action) {
                case 'review_requested':
                    const reviewer = event.requested_reviewer.full_name || event.requested_reviewer.login
                    message = `${sender} 请求 ${reviewer} 评审合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}`
                    break
                case 'review_request_removed':
                    const reviewer_removed = event.requested_reviewer.full_name || event.requested_reviewer.login
                    message = `${sender} 取消了对 ${reviewer_removed} 的评审请求。\n目标合并请求： ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}`
                    break
                default:
                    message = `${sender} 对合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title} 进行了未知操作 ${event.action}`
                    break
            }
            message += `\n${event.pull_request.html_url}`
            break
        case 'pull_request_review_comment':
            const pr_review_content = transform(event.review.content)
            message = `
                ${sender} 评审了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n评审评论：\n${pr_review_content}\n${event.pull_request.html_url}
                `
            break
        case 'pull_request_review_rejected':
            const pr_review_rejected_content = transform(event.review.content)
            message = `
                ${sender} 评审了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n需要变更：\n${pr_review_rejected_content}\n${event.pull_request.html_url}
                `
            break
        case 'pull_request_review_approved':
            const pr_review_approved_content = transform(event.review.content)
            message = `
                ${sender} 批准了合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title}\n${pr_review_approved_content}\n${event.pull_request.html_url}
                `
            break
        case 'pull_request_sync':
            message = `
                ${sender} 向合并请求 ${event.repository.full_name}#${event.pull_request.number}: ${event.pull_request.title} 推送了新的提交\n${event.pull_request.html_url}
                `
            break
        case 'fork':
            message = `
                ${sender} 派生存储库 ${event.repository.full_name} 到 ${event.forkee.full_name}\n${event.forkee.html_url}
                `
            break
        default:
            message = `
                ${sender} 对存储库 ${event.repository.full_name} 进行了未知操作。\n事件类型： ${event_type} , 操作类型： ${event.action}
                `
            break
    }
    // replace '\n,' with '\n'
    message = message.replace('\n,', '\n')
    message = '<>' + message + '</>'
    return message
}