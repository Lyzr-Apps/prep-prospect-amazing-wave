'use client'

import { useState, useRef } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { useConfig } from '@/lib/useConfig'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  Calendar,
  Mail,
  Database,
  Settings,
  Eye,
  History,
  Clock,
  User,
  Building2,
  GraduationCap,
  TrendingUp,
  MapPin,
  Trophy,
  Users,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  X,
  Play,
  Download,
  Upload,
  RotateCcw,
  AlertCircle
} from 'lucide-react'

// TypeScript interfaces based on actual response schemas
interface ExternalParticipant {
  email: string
  name: string
}

interface Meeting {
  meeting_title: string
  meeting_time: string
  duration_minutes: number
  attendees: string[]
  external_participants: ExternalParticipant[]
}

interface CalendarAgentResult {
  meetings: Meeting[]
  total_meetings: string
  total_external_participants: string
}

interface ApolloCompany {
  name: string
  industry: string
  size: string
  funding_stage: string
  technologies: string[]
}

interface ApolloContact {
  email: string
  name: string
  title: string
  seniority: string
  company: ApolloCompany
}

interface ApolloEnrichmentResult {
  enriched_contacts: ApolloContact[]
  total_enriched: number
  enrichment_rate: string
}

interface Education {
  school: string
  degree: string
  year: string
}

interface LinkedInProfile {
  name: string
  profile_url: string
  recent_posts: string[]
  recent_announcements: string[]
  hobbies: string[]
  languages: string[]
  education: Education[]
  location: string
  mutual_connections: string[]
  previous_companies: string[]
}

interface LinkedInResult {
  linkedin_profiles: LinkedInProfile[]
  total_profiles_researched: string
}

interface WebResearchResult {
  research_findings: any[]
  total_news_items: string
}

interface SportsResult {
  date: string
  opponent: string
  score: string
  result: string
}

interface SportsTeam {
  team_name: string
  league?: string
  sport?: string
  recent_results: SportsResult[]
  current_record?: string
}

interface SportsIntel {
  person_name: string
  hometown: string
  college: string
  professional_teams: SportsTeam[]
  college_teams: SportsTeam[]
  conversation_starters: string[]
}

interface SportsIntelligenceResult {
  sports_intel: SportsIntel[]
  total_teams_tracked: string
}

interface MutualConnection {
  name: string
  title: string
  company: string
  relationship_to_rep: string
  relationship_to_prospect: string
}

interface OverlappingCompany {
  company_name: string
  rep_tenure: string
  prospect_tenure: string
  overlap_period: string
}

interface SharedEducation {
  institution: string
  rep_details: string
  prospect_details: string
}

interface ConnectionAnalysis {
  prospect_name: string
  mutual_connections: MutualConnection[]
  overlapping_companies: OverlappingCompany[]
  shared_education: SharedEducation[]
  connection_strength: string
  recommended_approach: string
}

interface ConnectionAnalyzerResult {
  connection_analysis: ConnectionAnalysis[]
  total_mutual_connections: number
}

interface EmailComposerResult {
  response: string
  action_taken?: string
  data?: any
  suggestions?: string[]
}

// Re-export DayPlannerConfig type from useConfig hook
import type { DayPlannerConfig } from '@/lib/useConfig'

// Meeting preview state
interface EnrichedParticipant {
  email: string
  name: string
  apollo?: ApolloContact
  linkedin?: LinkedInProfile
  news?: any[]
  sports?: SportsIntel
  connections?: ConnectionAnalysis
}

interface HistoryEntry {
  id: string
  date: string
  meetings: number
  participants: number
  emailStatus: 'sent' | 'draft' | 'failed'
  emailContent: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('config')
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [linkedInLoading, setLinkedInLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Configuration state with persistence
  const { config, setConfig, resetConfig, exportConfig, importConfig, isLoaded } = useConfig()

  // Meeting preview state
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [enrichedParticipants, setEnrichedParticipants] = useState<Map<string, EnrichedParticipant>>(new Map())
  const [expandedMeetings, setExpandedMeetings] = useState<Set<number>>(new Set())
  const [expandedParticipants, setExpandedParticipants] = useState<Set<string>>(new Set())
  const [debugInfo, setDebugInfo] = useState<string>('')

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: '1',
      date: '2026-02-06',
      meetings: 3,
      participants: 5,
      emailStatus: 'sent',
      emailContent: 'Sample morning prep email sent successfully...'
    }
  ])
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(new Set())

  // Connection status
  const [connectionStatus, setConnectionStatus] = useState({
    calendar: true,
    gmail: true,
    apollo: true,
  })

  // Agent IDs
  const AGENTS = {
    coordinator: '69864ca97a04453a977498b9',
    calendar: '69864be4f823535a6d0c1816',
    apollo: '69864bfce6006e489659fdfe',
    linkedin: '69864c12cb7e55fd6b4f4c48',
    webResearch: '69864c29f823535a6d0c1819',
    sports: '69864c3e8a54fe39adbfb71c',
    connections: '69864c58812c228b6df02829',
    emailComposer: '69864c727a04453a977498b8',
  }

  // Save configuration
  const handleSaveConfig = async () => {
    setLoading(true)
    try {
      // Configuration is automatically saved to localStorage via the useConfig hook
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Configuration saved successfully')
    } catch (error) {
      console.error('Failed to save configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle file import
  const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      await importConfig(file)
      console.log('Configuration imported successfully')
    } catch (error) {
      console.error('Failed to import configuration:', error)
    } finally {
      setLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Fetch previous companies from LinkedIn profile
  const handleFetchLinkedInData = async () => {
    if (!config.linkedInUrl) {
      console.warn('Please enter your LinkedIn profile URL first')
      return
    }

    setLinkedInLoading(true)
    try {
      const message = `Research this LinkedIn profile and extract the previous companies this person has worked at: ${config.linkedInUrl}

Please return a list of previous company names (not including current company) as a comma-separated string.`

      const result = await callAIAgent(message, AGENTS.linkedin)

      console.log('LinkedIn agent response:', result)

      if (result.success && result.response.status === 'success') {
        const linkedInData = result.response.result

        // Try to extract previous companies from the response
        let previousCompanies = ''

        // Check if there's a linkedin_profiles array with previous_companies
        if (linkedInData.linkedin_profiles?.[0]?.previous_companies) {
          const companies = linkedInData.linkedin_profiles[0].previous_companies
          previousCompanies = Array.isArray(companies) ? companies.join(', ') : companies
        }
        // Check for a direct previous_companies field
        else if (linkedInData.previous_companies) {
          previousCompanies = Array.isArray(linkedInData.previous_companies)
            ? linkedInData.previous_companies.join(', ')
            : linkedInData.previous_companies
        }
        // Check for text response
        else if (linkedInData.text || linkedInData.response) {
          previousCompanies = linkedInData.text || linkedInData.response
        }

        if (previousCompanies) {
          setConfig(prev => ({ ...prev, previousCompanies }))
          console.log('Previous companies updated:', previousCompanies)
        } else {
          console.warn('Could not extract previous companies from LinkedIn profile')
          console.warn('Response structure:', linkedInData)
        }
      } else {
        console.error('LinkedIn agent failed:', result.response.message)
      }
    } catch (error) {
      console.error('Failed to fetch LinkedIn data:', error)
    } finally {
      setLinkedInLoading(false)
    }
  }

  // Generate preview by calling the Day Prep Coordinator
  const handleGeneratePreview = async () => {
    setPreviewLoading(true)
    try {
      // Use the selected date from config
      const selectedDate = new Date(config.selectedDate)
      const dateFormatted = config.selectedDate // YYYY-MM-DD
      const dateReadable = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      // Build the message for the coordinator with explicit external participant filtering
      const message = `Generate a day prep preview for ${dateReadable} (${dateFormatted}) with the following settings:

Company domains to filter OUT (these are internal): ${config.companyDomains}
Email recipient: ${config.emailRecipient || 'Not specified'}
LinkedIn URL: ${config.linkedInUrl || 'Not specified'}
Previous companies: ${config.previousCompanies || 'Not specified'}
Hometown: ${config.hometown || 'Not specified'}
Research preferences: Apollo=${config.enableApollo}, LinkedIn=${config.enableLinkedIn}, News=${config.enableNews}, Sports=${config.enableSports}, Connections=${config.enableConnections}

IMPORTANT: Please retrieve ALL calendar events for ${dateFormatted}. Filter to show ONLY meetings that have external participants (participants whose email domains do NOT match: ${config.companyDomains}). For each meeting with external participants, provide detailed research on those external participants only.`

      // Call the coordinator agent
      const result = await callAIAgent(message, AGENTS.coordinator)

      console.log('Coordinator response:', JSON.stringify(result, null, 2))

      // Store debug info for user inspection
      setDebugInfo(JSON.stringify(result, null, 2))

      if (result.success && result.response.status === 'success') {
        // Parse the coordinator response
        const coordinatorResult = result.response.result

        console.log('Coordinator result structure:', {
          has_final_output: !!coordinatorResult.final_output,
          has_sub_agent_results: !!coordinatorResult.sub_agent_results,
          final_output_keys: coordinatorResult.final_output ? Object.keys(coordinatorResult.final_output) : [],
          sub_agent_count: coordinatorResult.sub_agent_results?.length || 0
        })

        // Extract calendar data - try multiple paths
        let extractedMeetings: Meeting[] = []

        if (coordinatorResult.final_output?.calendar?.meetings) {
          const calendarData = coordinatorResult.final_output.calendar as CalendarAgentResult
          extractedMeetings = calendarData.meetings || []
          console.log('Found meetings in final_output.calendar:', extractedMeetings.length)
        } else if (coordinatorResult.sub_agent_results) {
          // Try to find calendar data in sub-agent results
          const calendarAgent = coordinatorResult.sub_agent_results.find(
            (agent: any) => agent.agent_name === 'Calendar Agent' || agent.agent_name?.includes('Calendar')
          )
          console.log('Calendar agent found:', !!calendarAgent)
          console.log('Calendar agent structure:', calendarAgent ? Object.keys(calendarAgent) : [])

          if (calendarAgent?.output?.meetings) {
            extractedMeetings = calendarAgent.output.meetings
            console.log('Found meetings in sub_agent_results:', extractedMeetings.length)
          } else if (calendarAgent?.result?.meetings) {
            extractedMeetings = calendarAgent.result.meetings
            console.log('Found meetings in sub_agent result.meetings:', extractedMeetings.length)
          }
        }

        // Also check top-level meetings field
        if (extractedMeetings.length === 0 && coordinatorResult.meetings) {
          extractedMeetings = coordinatorResult.meetings
          console.log('Found meetings at top level:', extractedMeetings.length)
        }

        setMeetings(extractedMeetings)

        // Build enriched participants map from all sub-agent results
        const participantsMap = new Map<string, EnrichedParticipant>()

        // Add Apollo enrichment data
        if (coordinatorResult.final_output?.apollo) {
          const apolloData = coordinatorResult.final_output.apollo as ApolloEnrichmentResult
          apolloData.enriched_contacts?.forEach(contact => {
            const existing = participantsMap.get(contact.email) || {
              email: contact.email,
              name: contact.name,
            }
            participantsMap.set(contact.email, { ...existing, apollo: contact })
          })
        }

        // Add LinkedIn data
        if (coordinatorResult.final_output?.linkedin) {
          const linkedInData = coordinatorResult.final_output.linkedin as LinkedInResult
          linkedInData.linkedin_profiles?.forEach(profile => {
            const email = profile.profile_url // Use profile URL as key if email not available
            const existing = participantsMap.get(email) || {
              email: email,
              name: profile.name,
            }
            participantsMap.set(email, { ...existing, linkedin: profile })
          })
        }

        setEnrichedParticipants(participantsMap)

        // Extract email content from Email Composer Agent
        let emailContent = 'Email preview generated successfully.'
        if (coordinatorResult.final_output?.email) {
          const emailData = coordinatorResult.final_output.email as EmailComposerResult
          emailContent = emailData.response || emailData.data?.email_body || 'Email generated by Email Composer Agent'
        } else if (coordinatorResult.sub_agent_results) {
          const emailAgent = coordinatorResult.sub_agent_results.find(
            (agent: any) => agent.agent_name === 'Email Composer Agent'
          )
          if (emailAgent?.output) {
            emailContent = emailAgent.output.response || emailAgent.output.email_body || JSON.stringify(emailAgent.output, null, 2)
          }
        }

        // Add to history with accurate counts
        const newHistoryEntry: HistoryEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          meetings: extractedMeetings.length,
          participants: participantsMap.size,
          emailStatus: 'sent',
          emailContent: emailContent
        }
        setHistory(prev => [newHistoryEntry, ...prev])

        console.log('History entry created:', {
          meetings: extractedMeetings.length,
          participants: participantsMap.size,
          emailContentLength: emailContent.length
        })

        // Show preview tab
        setActiveTab('preview')

        // Log summary
        if (extractedMeetings.length === 0) {
          console.warn('No meetings found for today. This could mean:')
          console.warn('1. There are genuinely no meetings today')
          console.warn('2. The Calendar Agent is not connected properly')
          console.warn('3. The response format has changed')
          console.warn('Raw coordinator result:', coordinatorResult)
        }
      } else {
        console.error('Coordinator agent failed:', result.response.message)
        console.error('Full error response:', result)

        // Still create a history entry to track the failed attempt
        const failedHistoryEntry: HistoryEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          meetings: 0,
          participants: 0,
          emailStatus: 'failed',
          emailContent: `Error: ${result.response.message || 'Unknown error occurred'}`
        }
        setHistory(prev => [failedHistoryEntry, ...prev])
      }
    } catch (error) {
      console.error('Failed to generate preview:', error)

      // Track the error in history
      const errorHistoryEntry: HistoryEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        meetings: 0,
        participants: 0,
        emailStatus: 'failed',
        emailContent: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      }
      setHistory(prev => [errorHistoryEntry, ...prev])
    } finally {
      setPreviewLoading(false)
    }
  }

  // Toggle meeting expansion
  const toggleMeeting = (index: number) => {
    const newExpanded = new Set(expandedMeetings)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedMeetings(newExpanded)
  }

  // Toggle participant expansion
  const toggleParticipant = (email: string) => {
    const newExpanded = new Set(expandedParticipants)
    if (newExpanded.has(email)) {
      newExpanded.delete(email)
    } else {
      newExpanded.add(email)
    }
    setExpandedParticipants(newExpanded)
  }

  // Toggle history expansion
  const toggleHistory = (id: string) => {
    const newExpanded = new Set(expandedHistory)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedHistory(newExpanded)
  }

  // Refresh participant data
  const handleRefreshParticipant = async (email: string) => {
    console.log('Refreshing data for:', email)
    // In a real app, this would call individual agents to refresh data
  }

  // Test Calendar Agent directly
  const handleTestCalendar = async () => {
    setPreviewLoading(true)
    setErrorMessage('')
    try {
      const dateFormatted = config.selectedDate
      const message = `Please fetch ALL calendar events for ${dateFormatted}. Return the complete list of meetings including all participants.`

      console.log('Testing Calendar Agent with message:', message)
      const result = await callAIAgent(message, AGENTS.calendar)

      console.log('Calendar Agent direct response:', JSON.stringify(result, null, 2))
      setDebugInfo(JSON.stringify(result, null, 2))

      // Display error if present
      if (!result.success || result.response.status === 'error') {
        const errorMsg = result.error || result.response.message || 'Unknown error from Calendar Agent'
        setErrorMessage(`Calendar Agent Error: ${errorMsg}`)
        console.error('Calendar Agent returned error:', errorMsg)
      } else {
        setErrorMessage('')
        console.log('Calendar Agent test successful!')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error'
      setErrorMessage(`Calendar test failed: ${errorMsg}`)
      console.error('Calendar test failed:', error)
    } finally {
      setPreviewLoading(false)
    }
  }

  // Test with simpler message
  const handleTestCalendarSimple = async () => {
    setPreviewLoading(true)
    setErrorMessage('')
    try {
      const message = 'List my calendar events for today'

      console.log('Testing Calendar Agent (simple) with message:', message)
      const result = await callAIAgent(message, AGENTS.calendar)

      console.log('Calendar Agent simple test response:', JSON.stringify(result, null, 2))
      setDebugInfo(JSON.stringify(result, null, 2))

      if (!result.success || result.response.status === 'error') {
        const errorMsg = result.error || result.response.message || 'Unknown error from Calendar Agent'
        setErrorMessage(`Calendar Agent Error: ${errorMsg}`)
        console.error('Calendar Agent returned error:', errorMsg)
      } else {
        setErrorMessage('')
        console.log('Calendar Agent simple test successful!')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error'
      setErrorMessage(`Calendar test failed: ${errorMsg}`)
      console.error('Calendar test failed:', error)
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Day Planner for Sales Enablement
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Automated morning prep for sales meetings
                </p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <Badge variant={connectionStatus.calendar ? "default" : "destructive"}>
                  {connectionStatus.calendar ? 'Calendar Connected' : 'Calendar Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Badge variant={connectionStatus.gmail ? "default" : "destructive"}>
                  {connectionStatus.gmail ? 'Gmail Connected' : 'Gmail Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <Badge variant={connectionStatus.apollo ? "default" : "destructive"}>
                  {connectionStatus.apollo ? 'Apollo Connected' : 'Apollo Disconnected'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Meeting Preview
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History Log
            </TabsTrigger>
          </TabsList>

          {/* Configuration Dashboard */}
          <TabsContent value="config" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Settings Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Schedule Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Schedule Settings
                    </CardTitle>
                    <CardDescription>
                      Configure when to run the daily prep workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enabled">Enable Daily Prep</Label>
                      <Switch
                        id="enabled"
                        checked={config.enabled}
                        onCheckedChange={(checked) =>
                          setConfig(prev => ({ ...prev, enabled: checked }))
                        }
                      />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheduleTime">Run Time</Label>
                        <Input
                          id="scheduleTime"
                          type="time"
                          value={config.scheduleTime}
                          onChange={(e) =>
                            setConfig(prev => ({ ...prev, scheduleTime: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                          id="timezone"
                          value={config.timezone}
                          onChange={(e) =>
                            setConfig(prev => ({ ...prev, timezone: e.target.value }))
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Company Domain */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Domain
                    </CardTitle>
                    <CardDescription>
                      Filter external participants by company email domain
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="companyDomains">Company Email Domain(s)</Label>
                      <Input
                        id="companyDomains"
                        placeholder="company.com, subsidiary.com"
                        value={config.companyDomains}
                        onChange={(e) =>
                          setConfig(prev => ({ ...prev, companyDomains: e.target.value }))
                        }
                      />
                      <p className="text-xs text-slate-500">
                        Separate multiple domains with commas
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales Rep Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Sales Rep Profile
                    </CardTitle>
                    <CardDescription>
                      Your information for connection analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailRecipient">Email Address for Morning Prep</Label>
                      <Input
                        id="emailRecipient"
                        type="email"
                        placeholder="your.email@company.com"
                        value={config.emailRecipient}
                        onChange={(e) =>
                          setConfig(prev => ({ ...prev, emailRecipient: e.target.value }))
                        }
                      />
                      <p className="text-xs text-slate-500">
                        Where to send the daily prep email
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedInUrl">LinkedIn Profile URL</Label>
                      <Input
                        id="linkedInUrl"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={config.linkedInUrl}
                        onChange={(e) =>
                          setConfig(prev => ({ ...prev, linkedInUrl: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="previousCompanies">Previous Companies</Label>
                      <div className="flex gap-2">
                        <Input
                          id="previousCompanies"
                          placeholder="Company A, Company B, Company C"
                          value={config.previousCompanies}
                          onChange={(e) =>
                            setConfig(prev => ({ ...prev, previousCompanies: e.target.value }))
                          }
                          className="flex-1"
                        />
                        <Button
                          onClick={handleFetchLinkedInData}
                          disabled={linkedInLoading || !config.linkedInUrl}
                          variant="outline"
                          size="default"
                          className="whitespace-nowrap"
                        >
                          {linkedInLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Used for finding overlapping employment history. Click the refresh button to auto-fill from LinkedIn.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hometown">Hometown</Label>
                      <Input
                        id="hometown"
                        placeholder="City, State"
                        value={config.hometown}
                        onChange={(e) =>
                          setConfig(prev => ({ ...prev, hometown: e.target.value }))
                        }
                      />
                      <p className="text-xs text-slate-500">
                        Used for sports team intelligence
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Research Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Research Preferences
                    </CardTitle>
                    <CardDescription>
                      Choose which research types to include
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableApollo">Apollo Enrichment</Label>
                        <p className="text-xs text-slate-500">
                          Company data, title, seniority, technologies
                        </p>
                      </div>
                      <Switch
                        id="enableApollo"
                        checked={config.enableApollo}
                        onCheckedChange={(checked) =>
                          setConfig(prev => ({ ...prev, enableApollo: checked }))
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableLinkedIn">LinkedIn Research</Label>
                        <p className="text-xs text-slate-500">
                          Recent posts, education, hobbies, mutual connections
                        </p>
                      </div>
                      <Switch
                        id="enableLinkedIn"
                        checked={config.enableLinkedIn}
                        onCheckedChange={(checked) =>
                          setConfig(prev => ({ ...prev, enableLinkedIn: checked }))
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableNews">Web Research</Label>
                        <p className="text-xs text-slate-500">
                          Company news, funding, product launches
                        </p>
                      </div>
                      <Switch
                        id="enableNews"
                        checked={config.enableNews}
                        onCheckedChange={(checked) =>
                          setConfig(prev => ({ ...prev, enableNews: checked }))
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableSports">Sports Intelligence</Label>
                        <p className="text-xs text-slate-500">
                          Recent scores and team performance
                        </p>
                      </div>
                      <Switch
                        id="enableSports"
                        checked={config.enableSports}
                        onCheckedChange={(checked) =>
                          setConfig(prev => ({ ...prev, enableSports: checked }))
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableConnections">Connection Analysis</Label>
                        <p className="text-xs text-slate-500">
                          Mutual connections and overlapping companies
                        </p>
                      </div>
                      <Switch
                        id="enableConnections"
                        checked={config.enableConnections}
                        onCheckedChange={(checked) =>
                          setConfig(prev => ({ ...prev, enableConnections: checked }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Panel */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Next Scheduled Run</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-2xl font-bold">
                        <Clock className="h-6 w-6 text-blue-600" />
                        {config.scheduleTime}
                      </div>
                      <p className="text-sm text-slate-600">
                        {config.timezone.replace('America/', '').replace('_', ' ')}
                      </p>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Status</span>
                          <Badge variant={config.enabled ? "default" : "secondary"}>
                            {config.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Meetings Detected</span>
                          <span className="font-medium">{meetings.length}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="selectedDate">Select Date</Label>
                      <Input
                        id="selectedDate"
                        type="date"
                        value={config.selectedDate}
                        onChange={(e) =>
                          setConfig(prev => ({ ...prev, selectedDate: e.target.value }))
                        }
                      />
                      <p className="text-xs text-slate-500">
                        Choose a specific date to run the planner
                      </p>
                    </div>

                    <Button
                      onClick={handleGeneratePreview}
                      disabled={previewLoading}
                      className="w-full"
                      variant="default"
                    >
                      {previewLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Preview...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Generate Preview
                        </>
                      )}
                    </Button>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-700">Diagnostic Tests</p>
                      <Button
                        onClick={handleTestCalendar}
                        disabled={previewLoading}
                        className="w-full"
                        variant="secondary"
                      >
                        {previewLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-2 h-4 w-4" />
                            Test Calendar (Date Specific)
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleTestCalendarSimple}
                        disabled={previewLoading}
                        className="w-full"
                        variant="secondary"
                      >
                        {previewLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-2 h-4 w-4" />
                            Test Calendar (Simple)
                          </>
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={handleSaveConfig}
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Save Configuration
                        </>
                      )}
                    </Button>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 font-medium">Configuration Management</p>

                      <Button
                        onClick={exportConfig}
                        disabled={loading}
                        className="w-full"
                        variant="outline"
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Config
                      </Button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json,.json"
                        onChange={handleImportConfig}
                        className="hidden"
                      />

                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="w-full"
                        variant="outline"
                        size="sm"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Import Config
                      </Button>

                      <Button
                        onClick={resetConfig}
                        disabled={loading}
                        className="w-full"
                        variant="outline"
                        size="sm"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset to Defaults
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Meeting Preview */}
          <TabsContent value="preview" className="mt-6">
            <div className="space-y-6">
              {/* Error Display */}
              {errorMessage && (
                <Card className="border-red-400 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      Error Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-800 font-medium mb-3">{errorMessage}</p>
                    <div className="bg-white p-3 rounded border border-red-200">
                      <p className="text-xs text-slate-600 mb-2 font-semibold">Troubleshooting Steps:</p>
                      <ol className="text-xs text-slate-700 space-y-1 list-decimal list-inside">
                        <li>Verify the Calendar Agent (ID: {AGENTS.calendar}) is properly configured in Lyzr</li>
                        <li>Check if Google Calendar OAuth is connected in the Lyzr dashboard</li>
                        <li>Try the "Test Calendar (Simple)" button to test with a basic query</li>
                        <li>Review the Debug Information panel below for the full error response</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Debug Panel */}
              {debugInfo && (
                <Card className="border-orange-300 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Debug Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium mb-2">Click to view raw agent response</summary>
                      <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96">
                        {debugInfo}
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        Meetings for {new Date(config.selectedDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </CardTitle>
                      <CardDescription>
                        {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} with external participants
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleGeneratePreview}
                      disabled={previewLoading}
                      variant="outline"
                      size="sm"
                    >
                      {previewLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {meetings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        No meetings found
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Click "Generate Preview" to fetch meetings for the selected date
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {meetings.map((meeting, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-600">
                          <CardHeader className="pb-3">
                            <div
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => toggleMeeting(index)}
                            >
                              <div className="flex-1">
                                <CardTitle className="text-lg">{meeting.meeting_title}</CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(meeting.meeting_time).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  <span>{meeting.duration_minutes} min</span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {meeting.external_participants.length} external participant
                                    {meeting.external_participants.length !== 1 ? 's' : ''}
                                  </span>
                                </CardDescription>
                              </div>
                              {expandedMeetings.has(index) ? (
                                <ChevronUp className="h-5 w-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                          </CardHeader>

                          {expandedMeetings.has(index) && (
                            <CardContent className="pt-0">
                              <Separator className="mb-4" />
                              <div className="space-y-3">
                                {meeting.external_participants.map((participant) => {
                                  const enrichedData = enrichedParticipants.get(participant.email)
                                  const isExpanded = expandedParticipants.has(participant.email)

                                  return (
                                    <Card key={participant.email} className="bg-slate-50">
                                      <CardHeader className="pb-3">
                                        <div
                                          className="flex items-center justify-between cursor-pointer"
                                          onClick={() => toggleParticipant(participant.email)}
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                              {participant.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                              <h4 className="font-medium">{participant.name}</h4>
                                              <p className="text-sm text-slate-600">{participant.email}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {enrichedData && (
                                              <div className="flex gap-1">
                                                {enrichedData.apollo && (
                                                  <Badge variant="secondary" className="text-xs">
                                                    <Database className="h-3 w-3 mr-1" />
                                                    Apollo
                                                  </Badge>
                                                )}
                                                {enrichedData.linkedin && (
                                                  <Badge variant="secondary" className="text-xs">
                                                    <User className="h-3 w-3 mr-1" />
                                                    LinkedIn
                                                  </Badge>
                                                )}
                                              </div>
                                            )}
                                            {isExpanded ? (
                                              <ChevronUp className="h-4 w-4 text-slate-400" />
                                            ) : (
                                              <ChevronDown className="h-4 w-4 text-slate-400" />
                                            )}
                                          </div>
                                        </div>
                                      </CardHeader>

                                      {isExpanded && enrichedData && (
                                        <CardContent className="pt-0 space-y-4">
                                          {/* Apollo Data */}
                                          {enrichedData.apollo && (
                                            <div className="space-y-2">
                                              <h5 className="text-sm font-medium flex items-center gap-2">
                                                <Building2 className="h-4 w-4" />
                                                Company Information
                                              </h5>
                                              <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                  <span className="text-slate-600">Title:</span>
                                                  <p className="font-medium">{enrichedData.apollo.title}</p>
                                                </div>
                                                <div>
                                                  <span className="text-slate-600">Seniority:</span>
                                                  <p className="font-medium">{enrichedData.apollo.seniority}</p>
                                                </div>
                                                <div>
                                                  <span className="text-slate-600">Company:</span>
                                                  <p className="font-medium">{enrichedData.apollo.company.name}</p>
                                                </div>
                                                <div>
                                                  <span className="text-slate-600">Industry:</span>
                                                  <p className="font-medium">{enrichedData.apollo.company.industry}</p>
                                                </div>
                                                <div>
                                                  <span className="text-slate-600">Size:</span>
                                                  <p className="font-medium">{enrichedData.apollo.company.size}</p>
                                                </div>
                                                <div>
                                                  <span className="text-slate-600">Funding:</span>
                                                  <p className="font-medium">{enrichedData.apollo.company.funding_stage}</p>
                                                </div>
                                              </div>
                                              {enrichedData.apollo.company.technologies.length > 0 && (
                                                <div>
                                                  <span className="text-xs text-slate-600">Technologies:</span>
                                                  <div className="flex flex-wrap gap-1 mt-1">
                                                    {enrichedData.apollo.company.technologies.map((tech) => (
                                                      <Badge key={tech} variant="outline" className="text-xs">
                                                        {tech}
                                                      </Badge>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* LinkedIn Data */}
                                          {enrichedData.linkedin && (
                                            <>
                                              <Separator />
                                              <div className="space-y-3">
                                                <h5 className="text-sm font-medium flex items-center gap-2">
                                                  <User className="h-4 w-4" />
                                                  LinkedIn Profile
                                                </h5>

                                                {enrichedData.linkedin.location && (
                                                  <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-slate-400" />
                                                    <span>{enrichedData.linkedin.location}</span>
                                                  </div>
                                                )}

                                                {enrichedData.linkedin.education.length > 0 && (
                                                  <div>
                                                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                                      <GraduationCap className="h-4 w-4 text-slate-400" />
                                                      <span>Education</span>
                                                    </div>
                                                    {enrichedData.linkedin.education.map((edu, idx) => (
                                                      <p key={idx} className="text-sm text-slate-700 ml-6">
                                                        {edu.degree} from {edu.school} ({edu.year})
                                                      </p>
                                                    ))}
                                                  </div>
                                                )}

                                                {enrichedData.linkedin.recent_posts.length > 0 && (
                                                  <div>
                                                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                                      <TrendingUp className="h-4 w-4 text-slate-400" />
                                                      <span>Recent Posts</span>
                                                    </div>
                                                    <ul className="space-y-1 ml-6">
                                                      {enrichedData.linkedin.recent_posts.slice(0, 2).map((post, idx) => (
                                                        <li key={idx} className="text-sm text-slate-700">
                                                          {post}
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}

                                                {enrichedData.linkedin.hobbies.length > 0 && (
                                                  <div>
                                                    <span className="text-xs text-slate-600">Hobbies:</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                      {enrichedData.linkedin.hobbies.map((hobby) => (
                                                        <Badge key={hobby} variant="outline" className="text-xs">
                                                          {hobby}
                                                        </Badge>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}

                                                {enrichedData.linkedin.mutual_connections.length > 0 && (
                                                  <div>
                                                    <span className="text-xs text-slate-600">
                                                      Mutual Connections ({enrichedData.linkedin.mutual_connections.length}):
                                                    </span>
                                                    <p className="text-sm text-slate-700 mt-1">
                                                      {enrichedData.linkedin.mutual_connections.join(', ')}
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            </>
                                          )}

                                          <Button
                                            onClick={() => handleRefreshParticipant(participant.email)}
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                          >
                                            <RefreshCw className="h-3 w-3 mr-2" />
                                            Refresh Data
                                          </Button>
                                        </CardContent>
                                      )}
                                    </Card>
                                  )
                                })}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Log */}
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Email History</CardTitle>
                    <CardDescription>
                      View past morning prep emails sent
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Export PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((entry) => {
                    const isExpanded = expandedHistory.has(entry.id)

                    return (
                      <Card key={entry.id} className="border">
                        <CardHeader className="pb-3">
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleHistory(entry.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div>
                                <h4 className="font-medium">{entry.date}</h4>
                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                                  <span>{entry.meetings} meetings</span>
                                  <span>•</span>
                                  <span>{entry.participants} participants</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={
                                  entry.emailStatus === 'sent'
                                    ? 'default'
                                    : entry.emailStatus === 'draft'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {entry.emailStatus === 'sent' && <Check className="h-3 w-3 mr-1" />}
                                {entry.emailStatus === 'failed' && <X className="h-3 w-3 mr-1" />}
                                {entry.emailStatus}
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        {isExpanded && (
                          <CardContent className="pt-0">
                            <Separator className="mb-4" />
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="text-sm font-semibold flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-blue-600" />
                                  Email Content Sent
                                </h5>
                                <Badge variant="outline" className="text-xs">
                                  To: {config.emailRecipient || 'Not configured'}
                                </Badge>
                              </div>
                              <div className="bg-white dark:bg-slate-900 rounded-md p-4 border border-slate-200 dark:border-slate-700">
                                <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                                  {entry.emailContent}
                                </pre>
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
