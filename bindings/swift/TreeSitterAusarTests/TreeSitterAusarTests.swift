import XCTest
import SwiftTreeSitter
import TreeSitterAusar

final class TreeSitterAusarTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_ausar())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Ausar grammar")
    }
}
