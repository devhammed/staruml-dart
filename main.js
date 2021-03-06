const fs = require('fs')
const path = require('path')

const CodeWriter = require('./code-writer')

function getViews (diagram, type) {
  return diagram.ownedViews
    .filter(view => view instanceof type)
    .map(typeView => typeView.model)
}

function generateClasses (diagram, folder) {
  const dataClasses = getViews(diagram, type.UMLClassView).filter(
    umlClass => (umlClass.stereotype || '').toLowerCase() === 'dataClass'
  )

  if (!dataClasses.length) {
    return app.toast.error('There is no classes to generate!')
  }

  dataClasses.forEach(dataClass => {
    const codeWriter = new CodeWriter()

    dataClass.attributes
      .filter(attribute => attribute.type instanceof type.UMLEnumeration)
      .forEach(({ name, literals }, attributeIndex) => {
        codeWriter.writeLine(`enum ${name} {`)

        codeWriter.indent()

        literals.forEach(({ name, documentation }, literalIndex) => {
          if (documentation !== '') {
            writer.writeLines(
              documentation.split('\n').map(line => `/// ${line}`)
            )
          }

          codeWriter.writeLine(`${name},`)

          if (literalIndex !== literals.length - 1) {
            codeWriter.writeLine('')
          }
        })

        codeWriter.outdent()

        codeWriter.writeLine('}')

        if (attributeIndex !== literals.length - 1) {
          codeWriter.writeLine('')
        }
      })
  })
}

function getOutputFolderAndGenerateClasses (diagram) {
  const files = app.dialogs.showOpenDialog(
    'Select a folder where generated classes will be located',
    null,
    null,
    { properties: ['openDirectory'] }
  )

  if (files && files.length > 0) {
    generateClasses(diagram, files[0])
  }
}

function handleDartGenerateCommand (diagram, folder) {
  if (!diagram || !diagram instanceof type.UMLClassDiagram) {
    app.elementListPickerDialog
      .showDialog(
        'Select a class diagram to generate the classes from',
        app.repository.select('@UMLClassDiagram')
      )
      .then(function ({ buttonId, returnValue }) {
        if (buttonId === 'ok') {
          if (!folder) {
            getOutputFolderAndGenerateClasses(returnValue)
          } else {
            generateClasses(returnValue, folder)
          }
        }
      })
  } else if (!folder) {
    getOutputFolderAndGenerateClasses(diagram)
  } else {
    generateClasses(diagram, folder)
  }
}

function initializeExtension () {
  app.commands.register(
    'dart:generate',
    handleDartGenerateCommand,
    'Generate Dart Data Classes'
  )
}

exports.init = initializeExtension
