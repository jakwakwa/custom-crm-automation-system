/**
 * Template Variable Parser
 * Replaces variables in templates with actual values
 * Supports syntax: {{variableName}}
 */

export interface TemplateVariables {
  // Person fields
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  phone?: string
  whatsapp?: string
  
  // Company fields
  companyName?: string
  companyIndustry?: string
  companyWebsite?: string
  
  // Project fields
  projectTitle?: string
  projectStatus?: string
  
  // Custom fields
  [key: string]: string | undefined
}

/**
 * Parse template and replace variables with values
 * @param template - Template string with {{variables}}
 * @param variables - Object with variable values
 * @returns Parsed template with values replaced
 */
export function parseTemplate(template: string, variables: TemplateVariables): string {
  let parsed = template
  
  // Replace each variable
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined) {
      // Create regex to match {{key}} (case-insensitive)
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi')
      parsed = parsed.replace(regex, value)
    }
  })
  
  return parsed
}

/**
 * Extract all variables from a template
 * @param template - Template string
 * @returns Array of variable names found in the template
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{\s*(\w+)\s*\}\}/g
  const variables: string[] = []
  let match
  
  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }
  
  return variables
}

/**
 * Validate that all required variables are provided
 * @param template - Template string
 * @param variables - Object with variable values
 * @returns Object with isValid flag and missing variables array
 */
export function validateTemplate(
  template: string,
  variables: TemplateVariables
): { isValid: boolean; missing: string[] } {
  const required = extractVariables(template)
  const missing = required.filter((key) => !variables[key])
  
  return {
    isValid: missing.length === 0,
    missing,
  }
}

/**
 * Get available template variables with descriptions
 * @returns Array of available variables with descriptions
 */
export function getAvailableVariables(): Array<{ name: string; description: string }> {
  return [
    { name: 'firstName', description: "Person's first name" },
    { name: 'lastName', description: "Person's last name" },
    { name: 'fullName', description: "Person's full name" },
    { name: 'email', description: "Person's email address" },
    { name: 'phone', description: "Person's phone number" },
    { name: 'whatsapp', description: "Person's WhatsApp number" },
    { name: 'companyName', description: 'Company name' },
    { name: 'companyIndustry', description: 'Company industry' },
    { name: 'companyWebsite', description: 'Company website' },
    { name: 'projectTitle', description: 'Project title' },
    { name: 'projectStatus', description: 'Project status' },
  ]
}
