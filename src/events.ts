// 无 sha 、ref、ref_type 时，fallback 到 repository

export interface User {
  id: number;
  login: string;
  login_name: string;
  full_name: string;
  email: string;
  avatar_url: string;
  language: string;
  is_admin: boolean;
  last_login: string;
  created: string;
  restricted: boolean;
  active: boolean;
  prohibit_login: boolean;
  location: string;
  pronouns: string;
  website: string;
  description: string;
  visibility: string;
  followers_count: number;
  following_count: number;
  starred_repos_count: number;
  username: string;
}

export interface Permissions {
  admin: boolean;
  push: boolean;
  pull: boolean;
}

export interface Organization extends User {}

export interface InternalTracker {
  enable_time_tracker: boolean;
  allow_only_contributors_to_track_time: boolean;
  enable_issue_dependencies: boolean;
}

export interface Repository {
  id: number;
  owner: User;
  name: string;
  full_name: string;
  description: string;
  empty: boolean;
  private: boolean;
  fork: boolean;
  template: boolean;
  parent: null;
  mirror: boolean;
  size: number;
  language: string;
  languages_url: string;
  html_url: string;
  url: string;
  link: string;
  ssh_url: string;
  clone_url: string;
  original_url: string;
  website: string;
  stars_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  open_pr_counter: number;
  release_counter: number;
  default_branch: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string;
  permissions: Permissions;
  has_issues: boolean;
  internal_tracker: InternalTracker;
  has_wiki: boolean;
  wiki_branch: string;
  has_pull_requests: boolean;
  has_projects: boolean;
  has_releases: boolean;
  has_packages: boolean;
  has_actions: boolean;
  ignore_whitespace_conflicts: boolean;
  allow_merge_commits: boolean;
  allow_rebase: boolean;
  allow_rebase_explicit: boolean;
  allow_squash_merge: boolean;
  allow_fast_forward_only_merge: boolean;
  allow_rebase_update: boolean;
  default_delete_branch_after_merge: boolean;
  default_merge_style: string;
  default_allow_maintainer_edit: boolean;
  avatar_url: string;
  internal: boolean;
  mirror_interval: string;
  object_format_name: string;
  mirror_updated: string;
  repo_transfer: null;
}

export interface Commiter {
    name: string;
    email: string;
    username: string;
}

export interface Commmit {
  id: string;
  message: string;
  author: Commiter;
  committer: Commiter;
  verification: null;
  timestamp: string;
  added: string[];
  removed: string[];
  modified: string[];
}

export interface Release {
    id: number;
    tag_name: string;
    target_commitish: string;
    name: string;
    body: string;
    url: string;
    html_url: string;
    tarball_url: string;
    zipball_url: string;
    upload_url: string;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at: string;
    author: User;
    assets: Asset[];
}

export interface Asset {
    id: number;
    name: string;
    size: number;
    download_count: number;
    created_at: string;
    uuid: string;
    browser_download_url: string;
}

export interface Issue {
    id: number;
    url: string;
    html_url: string;
    number: number;
    user: User;
    original_author: string;
    original_author_id: number;
    title: string;
    body: string;
    ref: string;
    assets: Asset[];
    labels: Label[];
    milestone: Milestone;
    assignee: User;
    assignees: User[];
    state: string;
    is_locked: boolean;
    comments: number;
    created_at: string;
    updated_at: string;
    closed_at: string;
    due_date: string;
    pull_request: PullRequest;
    repository: Repository;
    pin_order: number;
}

export interface Changes {
    title: {
        from: string;
    };
    body: {
        from: string;
    };
}

export interface Label {
    id: number;
    name: string;
    exclusive: boolean;
    is_archived: boolean;
    color: string;
    url: string;
}

export interface Milestone {
    id: number;
    title: string;
    description: string;
    state: string;
    open_issues: number;
    closed_issues: number;
    due_on: string;
    created_at: string;
    updated_at: string;
    closed_at: string;
    url: string;
}

export interface PullRequest {
    id: number;
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
    number: number;
    user: User;
    title: string;
    body: string;
    ref: string;
    assets: Asset[];
    labels: Label[];
    milestone: Milestone;
    assignee: User;
    assignees: User[];
    requested_reviewers: User[];
    state: string;
    is_locked: boolean;
    comments: number;
    mergeable: boolean;
    merged: boolean;
    merged_at: string;
    merge_commit_sha: string;
    merged_by: User;
    allow_maintainer_edit: boolean;
    base: Branch;
    head: Branch;
    merge_base: string;
    created_at: string;
    updated_at: string;
    closed_at: string;
    due_date: string;
    repository: Repository;
    pin_order: number;
}

export interface Branch {
    label: string;
    ref: string;
    sha: string;
    repo_id: number;
    repo: Repository;
}

export interface Review {
    type: string;
    content: string;
}

export interface Comment {
  id: number;
  html_url: string;
  pull_request_url: string;
  issue_url: string;
  user: User;
  original_author: string;
  original_author_id: number;
  body: string;
  assets: Asset[];
  created_at: string;
  updated_at: string;
}

export interface Event {
  sha: string;
  ref: string;
  ref_type: string;
  action: string;
  before: string;
  after: string;
  compare_url: string;
  release: Release;
  commits: Commmit[];
  total_commits: number;
  head_commit: Commmit;
  repository: Repository;
  organization: Organization;
  pusher: User;
  pusher_type: string;
  sender: User;
  // wiki
  page: string;
  comment: string | Comment;
  // issue & pull_request
  issue: Issue;
  is_pull: boolean;
  pull_request: PullRequest;
  changes: Changes;
  requested_reviewers: User[]; // current list of requested reviewers
  requested_reviewer: User; // current event's requested reviewer
  commit_id: string;
  review: Review;
  number: number; // Issue / PullRequest number
  // fork
  forkee: Repository;
}
