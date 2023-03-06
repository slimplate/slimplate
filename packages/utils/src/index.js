import s from 'slugify'
import shortuuid from 'short-uuid'
import df from 'dateformat'
import tto from 'template-templates'
import inflection from 'inflection'

const uuidGenerator = shortuuid()

// these are utils for the filename-string
export const uuid = () => uuidGenerator.uuid()
export const shortUuid = () => uuidGenerator.new() // mhvXdrZT4jP5T8vBxuvm75
export const slugify = value => s(value, { strict: true, lower: true }) // a_cool_title
export const dateFormat = (format = 'yyyy-mm-dd', value) => df(new Date(value || Date.now()), format)

export const tt = (value = '', vars) => tto(value || '', { uuid, shortUuid, slugify, ...inflection, dateFormat, ...vars })
