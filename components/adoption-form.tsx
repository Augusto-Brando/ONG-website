'use client'

// Formulário público "Quero adotar". Sem login: envia para /api/public/adoption.
// LGPD: consentimento obrigatório; honeypot `website` escondido para conter robôs.
import { useState } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  animalId?: number
  animalName?: string
  onSuccess?: () => void
}

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  city: '',
  housingType: '',
  hasOtherPets: '',
  message: '',
  consentLgpd: false,
  website: '',
}

export function AdoptionForm({ animalId, animalName, onSuccess }: Props) {
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.consentLgpd) {
      setError('É preciso aceitar o uso dos dados para o processo de adoção.')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/public/adoption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          city: form.city,
          housingType: form.housingType,
          hasOtherPets: form.hasOtherPets === '' ? null : form.hasOtherPets === 'sim',
          animalId: animalId ?? null,
          message: form.message,
          consentLgpd: form.consentLgpd,
          website: form.website,
        }),
      })

      if (res.status === 201 || res.status === 200) {
        setDone(true)
        setForm(emptyForm)
        toast.success('Solicitação enviada! Entraremos em contato.')
        onSuccess?.()
        return
      }

      const data = await res.json().catch(() => ({}))
      const message =
        res.status === 429
          ? data.error || 'Muitas solicitações em pouco tempo. Tente novamente mais tarde.'
          : data.error || 'Não foi possível enviar sua solicitação.'
      setError(message)
      toast.error(message)
    } catch {
      setError('Falha de conexão. Verifique sua internet e tente novamente.')
      toast.error('Falha de conexão. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div
        role="status"
        className="space-y-3 rounded-lg border border-border bg-card p-6 text-center"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <p className="font-semibold text-foreground">Solicitação enviada!</p>
        <p className="text-sm text-muted-foreground">
          Recebemos seus dados{animalName ? ` sobre ${animalName}` : ''}. Nossa equipe entrará em contato
          pelo telefone informado.
        </p>
        <Button type="button" variant="outline" onClick={() => setDone(false)}>
          Enviar outra solicitação
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {animalName && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">
          Interesse em adotar: <strong>{animalName}</strong>
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="adoption-name">Nome completo *</Label>
        <Input
          id="adoption-name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          autoComplete="name"
          required
          minLength={2}
          maxLength={120}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="adoption-phone">Telefone / WhatsApp *</Label>
          <Input
            id="adoption-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            autoComplete="tel"
            placeholder="(32) 99999-0000"
            required
            minLength={8}
            maxLength={30}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adoption-email">E-mail</Label>
          <Input
            id="adoption-email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="adoption-city">Cidade</Label>
          <Input
            id="adoption-city"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            autoComplete="address-level2"
            placeholder="Juiz de Fora/MG"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adoption-housing">Tipo de moradia</Label>
          <Select value={form.housingType} onValueChange={(v) => update('housingType', v)}>
            <SelectTrigger id="adoption-housing" className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="apartamento">Apartamento</SelectItem>
              <SelectItem value="sitio">Sítio / chácara</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adoption-other-pets">Tem outros animais em casa?</Label>
        <Select value={form.hasOtherPets} onValueChange={(v) => update('hasOtherPets', v)}>
          <SelectTrigger id="adoption-other-pets" className="w-full">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sim">Sim</SelectItem>
            <SelectItem value="nao">Não</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adoption-message">Mensagem</Label>
        <Textarea
          id="adoption-message"
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Conte um pouco sobre sua rotina e por que quer adotar."
        />
      </div>

      {/* Honeypot anti-spam: invisível e fora da ordem de tabulação. */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="adoption-website">Não preencha este campo</Label>
        <Input
          id="adoption-website"
          name="website"
          value={form.website}
          onChange={(e) => update('website', e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="adoption-consent"
          checked={form.consentLgpd}
          onCheckedChange={(c) => update('consentLgpd', c === true)}
          aria-describedby="adoption-consent-help"
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label htmlFor="adoption-consent" className="font-normal leading-snug">
            Autorizo a ONG a usar meus dados apenas para o processo de adoção *
          </Label>
          <p id="adoption-consent-help" className="text-xs text-muted-foreground">
            Seus dados não são compartilhados e podem ser apagados a qualquer momento a pedido (LGPD).
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={sending} className="w-full gap-2 sm:w-auto">
        <Send className="h-4 w-4" aria-hidden="true" />
        {sending ? 'Enviando...' : 'Quero adotar'}
      </Button>
    </form>
  )
}
