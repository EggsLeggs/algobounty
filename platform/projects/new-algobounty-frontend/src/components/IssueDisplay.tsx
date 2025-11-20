import React from 'react'
import { Github, Calendar, User } from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface IssueDisplayProps {
  issue: {
    title: string
    body: string | null
    number: number
    state: string
    html_url: string
    user: {
      login: string
      avatar_url: string
      html_url: string
    }
    labels: Array<{
      name: string
      color: string
    }>
    created_at: string
    updated_at: string
  }
  repository: {
    full_name: string
    html_url: string
  }
}

const MarkdownLink = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'a'>) => (
  <a
    {...props}
    target="_blank"
    rel="noopener noreferrer"
    className={cn('text-primary hover:underline', className)}
  >
    {children}
  </a>
)

const markdownComponents: Components = {
  a: MarkdownLink,
}

const IssueDisplay = ({ issue, repository }: IssueDisplayProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    target.style.display = 'none'
    const fallback = target.nextElementSibling as HTMLElement
    if (fallback) {
      fallback.style.display = 'flex'
    }
  }

  return (
    <div className="space-y-6">
      {/* Issue Title */}
      <div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 wonky-text">
          {issue.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>{repository.full_name}</span>
          </a>
          <span className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-foreground/10 text-foreground/80 font-medium">
              #{issue.number}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Opened {formatDate(issue.created_at)}</span>
          </span>
        </div>
      </div>

      {/* Issue Creator */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <a
          href={issue.user.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <img
              src={issue.user.avatar_url}
              alt={issue.user.login}
              className="w-10 h-10 rounded-full border-2 border-foreground/20"
              onError={handleAvatarError}
            />
            <div className="hidden w-10 h-10 rounded-full border-2 border-foreground/20 bg-foreground/10 items-center justify-center">
              <User className="h-5 w-5 text-foreground/60" />
            </div>
          </div>
          <span className="text-foreground/80 font-medium">{issue.user.login}</span>
        </a>
      </div>

      {/* Labels/Tags */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {issue.labels.map((label) => (
            <span
              key={label.name}
              className="px-3 py-1 rounded-full text-sm font-medium border-2 border-foreground/20"
              style={{
                backgroundColor: `${label.color}20`,
                color: `#${label.color}`,
                borderColor: `#${label.color}40`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Issue Description */}
      <div
        className={cn(
          'bg-background/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-foreground/20',
          'prose prose-sm max-w-none',
          'prose-headings:text-foreground prose-p:text-foreground/80 prose-a:text-primary prose-strong:text-foreground',
          'prose-code:text-foreground prose-pre:bg-foreground/5 prose-pre:border prose-pre:border-foreground/20'
        )}
      >
        {issue.body ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {issue.body}
          </ReactMarkdown>
        ) : (
          <p className="text-foreground/60 italic">No description provided.</p>
        )}
      </div>
    </div>
  )
}

export default IssueDisplay

