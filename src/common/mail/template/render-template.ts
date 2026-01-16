import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export function renderTemplate(
  templateName: string,
  context: Record<string, any>,
): string {
  const templatePath = path.join(__dirname, `${templateName}.hbs`);

  const source = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(source);

  return template(context);
}
