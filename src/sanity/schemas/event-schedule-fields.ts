import { defineField } from 'sanity'
import { DEFAULT_EVENT_TIMEZONE } from '../../lib/event-schedule'

const weekdays = [
  { title: 'Domingo', value: 0 }, { title: 'Lunes', value: 1 },
  { title: 'Martes', value: 2 }, { title: 'Miércoles', value: 3 },
  { title: 'Jueves', value: 4 }, { title: 'Viernes', value: 5 }, { title: 'Sábado', value: 6 },
]

export const eventScheduleFields = [
  defineField({
    name: 'scheduleType', title: 'Tipo de horario', type: 'string', initialValue: 'single',
    options: { list: [{ title: 'Evento único', value: 'single' }, { title: 'Actividad semanal', value: 'weekly' }] },
    description: 'Los eventos existentes sin tipo se consideran únicos.',
  }),
  defineField({
    name: 'timezone', title: 'Zona horaria', type: 'string', initialValue: DEFAULT_EVENT_TIMEZONE,
    description: 'Identificador IANA. Si se omite, se utiliza America/Mexico_City.',
  }),
  defineField({
    name: 'closed', title: 'Evento o serie finalizados manualmente', type: 'boolean', initialValue: false,
    description: 'Retira todo el evento de la agenda. Para eventos únicos sin fecha de fin, marcar al finalizar.',
  }),
  defineField({
    name: 'weekly', title: 'Horario semanal', type: 'object',
    hidden: ({ document }) => document?.scheduleType !== 'weekly',
    fields: [
      defineField({ name: 'seriesStart', title: 'Inicio de la serie', type: 'date' }),
      defineField({ name: 'seriesEnd', title: 'Último día de inicio de sesiones (opcional)', type: 'date' }),
      defineField({
        name: 'slots', title: 'Sesiones semanales', type: 'array',
        description: 'De 1 a 21 sesiones. Cada día puede tener horarios diferentes. La clave identifica la sesión en las excepciones.',
        of: [{
          type: 'object', name: 'weeklySlot', title: 'Sesión',
          fields: [
            defineField({ name: 'weekday', title: 'Día', type: 'number', options: { list: weekdays } }),
            defineField({ name: 'startTime', title: 'Hora de inicio (HH:mm)', type: 'string' }),
            defineField({ name: 'endTime', title: 'Hora de fin (HH:mm)', type: 'string' }),
            defineField({ name: 'endsNextDay', title: 'Termina al día siguiente', type: 'boolean', initialValue: false }),
          ],
          preview: {
            select: { weekday: 'weekday', start: 'startTime', end: 'endTime', key: '_key' },
            prepare: ({ weekday, start, end, key }) => ({
              title: `${weekdays.find((day) => day.value === weekday)?.title ?? 'Sesión'} ${start ?? ''}–${end ?? ''}`,
              subtitle: `Clave: ${key}`,
            }),
          },
        }],
      }),
      defineField({
        name: 'exceptions', title: 'Excepciones por sesión', type: 'array',
        description: 'Hasta 500. Una por fecha original y clave de sesión. Reprogramar sustituye la sesión original, incluso fuera de los límites de la serie. En cambios de horario estacional, las horas inexistentes se omiten y las repetidas usan la primera ocurrencia.',
        of: [{
          type: 'object', name: 'scheduleException', title: 'Excepción',
          fields: [
            defineField({ name: 'date', title: 'Fecha original', type: 'date' }),
            defineField({ name: 'slotKey', title: 'Clave de la sesión semanal', type: 'string', description: 'Copiar la clave que aparece debajo de la sesión semanal.' }),
            defineField({ name: 'action', title: 'Acción', type: 'string', options: { list: [{ title: 'Cancelar', value: 'cancel' }, { title: 'Reprogramar o cambiar horario', value: 'replace' }] } }),
            defineField({ name: 'replacementDate', title: 'Nueva fecha (puede ser la original)', type: 'date' }),
            defineField({ name: 'startTime', title: 'Nueva hora de inicio (HH:mm)', type: 'string' }),
            defineField({ name: 'endTime', title: 'Nueva hora de fin (HH:mm)', type: 'string' }),
            defineField({ name: 'endsNextDay', title: 'Termina al día siguiente', type: 'boolean', initialValue: false }),
            defineField({ name: 'unknownEnd', title: 'Fin desconocido para esta sesión', type: 'boolean', initialValue: false, description: 'Solo para reprogramaciones. Dejar la hora de fin vacía y cerrar esta sesión manualmente al finalizar.' }),
            defineField({ name: 'closed', title: 'Sesión de fin desconocido finalizada', type: 'boolean', initialValue: false }),
          ],
          preview: { select: { title: 'date', subtitle: 'slotKey' } },
        }],
      }),
    ],
  }),
]
