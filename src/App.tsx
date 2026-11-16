import { type FormEvent, useEffect, useState } from 'react'
import { ASSISTANTS, config } from './config'

type TriggerResponse = {
  status?: string
  message?: string
  to?: string
  answer?: string
  error?: string
  code?: string
}

export default function App() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [assistantId, setAssistantId] = useState<string>(config.defaultAssistantId)
  const [showCampusSelect, setShowCampusSelect] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<TriggerResponse | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pPhone = params.get('phone') || params.get('client') || params.get('tel') || ''
    const pName = params.get('name') || params.get('first_name') || ''
    const pEmail = params.get('email') || ''
    const pAssistant = params.get('assistant_id') || ''
    const pOrg = (params.get('org') || params.get('organization') || '').toLowerCase()

    if (pPhone) setPhone(pPhone.trim())
    if (pName) setName(pName.trim())
    if (pEmail) setEmail(pEmail.trim())

    if (pAssistant) {
      setAssistantId(pAssistant.trim())
      setShowCampusSelect(false)
    } else if (pOrg === 'canada') {
      setAssistantId(ASSISTANTS.canada.id)
    } else if (pOrg === 'cinta') {
      setAssistantId(ASSISTANTS.cinta.id)
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedPhone = phone.trim()
    const digits = trimmedPhone.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }

    setIsSubmitting(true)
    try {
      const url = `${config.apiBaseUrl}/campuslogin/trigger-tutor/${encodeURIComponent(assistantId)}`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: trimmedPhone,
          name: name.trim(),
          email: email.trim(),
        }),
      })

      const data = (await response.json().catch(() => ({}))) as TriggerResponse

      if (!response.ok) {
        if (response.status === 404 || data.code === 'contact_not_found') {
          throw new Error(
            'This phone number was not found in CampusLogin. Please make sure you enter the exact phone number registered with Admissions.'
          )
        }
        throw new Error(data.error || `Request failed with status ${response.status}`)
      }

      setSuccessData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start AI Tutor session.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <div className="card">
        <div className="badge">
          <span className="badge-dot" />
          AI Exam Prep Tutor
        </div>

        {successData ? (
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h1 className="title">Tutor Mode Activated!</h1>
            <p className="subtitle" style={{ marginBottom: 12 }}>
              We have sent the first SMS message to{' '}
              <strong>{successData.to || phone}</strong>. Reply directly on your phone to choose your
              program and begin practicing!
            </p>

            {successData.answer && (
              <div className="preview-bubble">
                <strong style={{ display: 'block', marginBottom: 4, color: '#16171a' }}>
                  SMS Sent:
                </strong>
                {successData.answer}
              </div>
            )}

            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setSuccessData(null)
                setError(null)
              }}
            >
              Back to Form
            </button>
          </div>
        ) : (
          <>
            <h1 className="title">Start Exam Prep Tutoring</h1>
            <p className="subtitle">
              Enter your registered phone number below to switch your SMS chat into AI Tutor Mode and
              practice daily state board exam questions.
            </p>

            <div className="programs-strip">
              <span className="program-pill">Barber</span>
              <span className="program-pill">Cosmetology</span>
              <span className="program-pill">Esthetician</span>
              <span className="program-pill">Nail Technician</span>
            </div>

            <form className="form" onSubmit={(e) => void handleSubmit(e)}>
              {showCampusSelect && (
                <div className="field">
                  <label className="label" htmlFor="campus">
                    Campus
                  </label>
                  <select
                    id="campus"
                    className="select"
                    value={assistantId}
                    onChange={(e) => setAssistantId(e.target.value)}
                  >
                    <option value={ASSISTANTS.cinta.id}>{ASSISTANTS.cinta.label}</option>
                    <option value={ASSISTANTS.canada.id}>{ASSISTANTS.canada.label}</option>
                  </select>
                </div>
              )}

              <div className="field">
                <label className="label" htmlFor="name">
                  First Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="input"
                  placeholder="e.g. Sarah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="phone">
                  Phone Number<span className="label-required">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  className="input"
                  placeholder="e.g. (415) 555-0123"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <span className="hint">
                  Must match the phone number registered in CampusLogin.
                </span>
              </div>

              <div className="field">
                <label className="label" htmlFor="email">
                  Email Address (Optional)
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="e.g. sarah@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && <div className="alert-error">{error}</div>}

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Starting Tutor Session...' : 'Start AI Tutoring via SMS'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
