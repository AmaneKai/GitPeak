export function accountAge(createdAtString: string): string {
  const createdDate = new Date(createdAtString)
  const currentDate = new Date()
  
  const differenceMs = currentDate.getTime() - createdDate.getTime()
  const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24))
  const differenceYears = Math.floor(differenceDays / 365)
  const remainingDays = differenceDays % 365
  const remainingMonths = Math.floor(remainingDays / 30)

  if (differenceYears > 0) {
    const yearLabel = differenceYears === 1 ? 'yr' : 'yrs'
    const monthLabel = remainingMonths === 1 ? 'mo' : 'mos'
    
    if (remainingMonths > 0)
      return `${differenceYears} ${yearLabel} ${remainingMonths} ${monthLabel}`
      
    return `${differenceYears} ${yearLabel}`
  }

  const monthLabel = remainingMonths === 1 ? 'month' : 'months'
  if (remainingMonths > 0)
    return `${remainingMonths} ${monthLabel}`

  const dayLabel = differenceDays === 1 ? 'day' : 'days'
  return `${differenceDays} ${dayLabel}`
}
