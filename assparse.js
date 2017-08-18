function parseAssTime (tstr) {
  let [h, m, s] = tstr.split(':').map(parseFloat)
  let sum = h * 60 * 60 + m * 60 + s
  if (!Number.isFinite(sum)) throw new Error('Malformated time notation')
  return sum
}

function parseKStr (kstr) {
  let stuff = []
  let syStart = 0
  let syLength = 0
  for (let i = 0; i < kstr.length;) {
    if (kstr[i] === '{' && !(i > 0 && kstr[i - 1] === '\\')) {
      let bracketEnd = kstr.indexOf('}', i)
      if (bracketEnd < 0) throw new Error('Unclosed bracket')
      let effectCommand = kstr.substring(i, bracketEnd + 1)
      if (effectCommand.length === 2) {
        i = bracketEnd + 1
        continue
      }
      let kCmdIndex = effectCommand.indexOf('\\k')
      if (kCmdIndex < 0) {
        i = bracketEnd + 1
        continue
      }
      let kCmdMatch = effectCommand.substring(kCmdIndex).match(/^\\k(\d+)/)
      if (!kCmdMatch) throw new Error('Malformated \\k command')
      let kTime = parseFloat(kCmdMatch[1])
      if (!Number.isFinite(kTime)) throw new Error('Malformated \\k number')
      syStart += syLength
      syLength = kTime / 100
      i = bracketEnd + 1
      continue
    } else {
      let nextBracket = kstr.indexOf('{', i)
      let syText
      if (nextBracket < 0) {
        syText = kstr.substring(i)
      } else {
        syText = kstr.substring(i, nextBracket)
      }
      stuff.push({
        start: syStart,
        end: syStart + syLength,
        text: syText
      })
      if (nextBracket < 0) {
        i = kstr.length
      } else {
        i = nextBracket
      }
    }
  }
  return stuff
}

module.exports = function (assStr) {
  let lines = assStr.split('\n')
  let i = 0
  while (i < lines.length) {
    let line = lines[i]
    if (line === '[Events]') {
      i += 2
      break
    } else {
      i += 1
    }
  }

  if (i >= lines.length) {
    throw new Error('No [event] stuff in your ass file.')
  }

  let stuff = []

  while (i < lines.length && /^Dialogue: /.test(lines[i])) {
    try {
      let line = lines[i].replace(/^Dialogue: \d+,/, '').split(',')
      let sTimeBegin = parseAssTime(line[0])
      let sTimeEnd = parseAssTime(line[1])
      let sStr = line.slice(8).join(',')
      let content = parseKStr(sStr)
      if (content.length > 0 && sTimeEnd - sTimeBegin > 0.01) {
        stuff.push({
          begin: sTimeBegin,
          end: sTimeEnd,
          content
        })
      }
      i++
    } catch (e) {
      throw new Error(e.message + ` (at line ${i})`)
    }
  }

  return stuff
}
