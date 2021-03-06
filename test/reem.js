
var path = require('path'),
	Reem = require('../lib/index'),
	assert = require('assert');

describe("Reem", function() {
	describe("#constructor()", function() {
		it("should not require the `new` keyword", function() {
			assert.ok(Reem(__dirname) instanceof Reem);
			assert.ok(new Reem(__dirname) instanceof Reem);
		});
		it("should accept a String argument", function() {
			assert.doesNotThrow(function() {
				Reem(__dirname);
			});
		});
		it("should throw if the first argument is not a String", function() {
			assert.throws(function() {
				Reem({eric: 'cartman'});
			}, Error);
			assert.throws(function() {
				Reem(1890);
			}, Error);
			assert.throws(function() {
				Reem(function() {
					return "Kevin Spacey";
				});
			}, Error);
		});
		it("should, by default, not be in production mode", function() {
			assert.equal(false, Reem(__dirname).env.production);
		});
		it("should have a Post middleware stack", function() {
			var reem = Reem(__dirname);
			assert.ok(reem.Post instanceof Reem.Ware);
			assert.equal(reem.Post.context, reem);
		});
		it("should have a File middleware stack", function() {
			var reem = Reem(__dirname);
			assert.ok(reem.File instanceof Reem.Ware);
			assert.equal(reem.File.context, reem);
		});
		it("should have a List middleware stack", function() {
			var reem = Reem(__dirname);
			assert.ok(reem.List instanceof Reem.Ware);
			assert.equal(reem.List.context, reem);
		});
		it("should have the index plugin in the List stack", function() {
			var reem = Reem(__dirname);
			assert.equal(1, reem.List.plugs.length);
		});
		it("should have a Page middleware stack", function() {
			var reem = Reem(__dirname);
			assert.ok(reem.Page instanceof Reem.Ware);
			assert.equal(reem.Page.context, reem);
		});
	});
	describe("#ware()", function() {
		it("should return a Ware instance", function() {
			assert.ok(Reem(__dirname).ware() instanceof Reem.Ware);
		});
		it("should have `this` as the default context", function() {
			var r = Reem(__dirname);
			assert.equal(r, r.ware().context);
		});
	});
	describe("#addPage()", function() {
		it("should add a new page to array `this.pages`", function() {
			var r = Reem(__dirname),
				page = {};
			r.addPage(page);
			assert.equal(page, r.pages.pop());
		});
		it("should set page.filetype to 'page'", function() {
			var r = Reem(__dirname),
				page = {};
			r.addPage(page);
			assert.equal('page', r.pages.pop().filetype);
		});
		it("should set page.fixedWrite to true", function() {
			var r = Reem(__dirname),
				page = {};
			r.addPage(page);
			assert.equal(true, r.pages.pop().fixedWrite);
		});
		it("should set page.renderFile to true", function() {
			var r = Reem(__dirname),
				page = {};
			r.addPage(page);
			assert.equal(true, r.pages.pop().renderFile);
		});
	});
	describe("#build()", function() {

	});
	describe("#diffBuild()", function() {
		it("should redirect to #build() if there is no cache", function(done) {
			var reem = Reem(__dirname);
			reem.build = function(next) { next(); }
			reem.diffBuild("filename", done);
		});
		it("should redirect to #build() if the file is not in the source directory", function(done) {
			var reem = Reem(__dirname);
			reem._tree = {little: "tree"};
			reem.build = function(tree, next) {
				assert.equal(tree, reem._tree);
				next();
			}
			reem.diffBuild(path.join(__dirname, 'layout', 'template'), done);
		});
		it("should call #read() with a filename-derived list node", function(done) {
			var reem = Reem(__dirname),
				filepath = path.join(__dirname, 'source', 'directory', 'file'),
				listpath = path.dirname(filepath);
			reem._tree = reem.fs.source;
			reem.build = function() {throw new Error("#build() should not be called.");}
			reem.read = function(node, next) {
				assert.equal(listpath, node.sourcePath);
				assert.equal('directory', node.basename);
				assert.equal('', node.extension);
				done();
			}
			assert.doesNotThrow(function() {
				reem.diffBuild(filepath, function(error) {});
			});
		});
	});
	describe("#read()", function() {

	});
	describe("#cache()", function() {
		it("should clone the first argument to `this._tree`", function(done) {
			var reem = Reem(__dirname),
				tree = {little: 'tree'};
			assert.equal(void 0, reem._tree);
			reem.cache(tree, function(error, result) {
				assert.deepEqual(tree, reem._tree);
				assert.notStrictEqual(tree, reem._tree);
				done();
			});
		});
	});
	describe("#link()", function() {
		it("should set the root list's parent to null", function(done) {
			var reem = Reem(__dirname),
				list = {
					posts: [],
					files: [],
					lists: []
				};
			reem.link(list, function(error, list) {
				assert.equal(null, list.list);
				done();
			});
		});
		it("should set the child nodes' list to the parent list", function(done) {
			var reem = Reem(__dirname),
				list = {
					posts: [],
					files: [],
					lists: []
				},
				testList = {
					posts: [{}],
					files: [{}],
					lists: [list]
				};
			reem.link(testList, function(error, list) {
				assert.equal(testList, list.posts[0].list);
				assert.equal(testList, list.files[0].list);
				assert.equal(testList, list.lists[0].list);
				done();
			});
		});
	});
	describe("#fill()", function() {

	});
	describe("#clean()", function() {

	});
	describe("#write()", function() {

	});
	describe("#render()", function() {
		it("should return the item's content if item.renderFile is not set", function(done) {
			var reem = Reem(__dirname),
				item = {content: 'string'};
			reem.render(item, function(error, content) {
				assert.equal(item.content, content);
				done();
			});
		});
		it("should, if no engine is specified, return the item's content", function(done) {
			var reem = Reem(__dirname);
			reem.view.engine = null;
			reem.render({content: "string", renderFile: true}, function(error, html) {
				assert.equal("string", html);
				done();
			});
		});
		it("should intelligently guess the template view name", function(done) {
			var reem = Reem(__dirname),
				item = {filetype: 'post', renderFile: true};
			reem.view.extension = '.html';
			reem.render(item, function(error, html) {
				assert.equal('post.html', item.view);
				done();
			});
		});
	});
	describe("#error()", function() {
		it("should return the passed function or a no-op", function() {
			var r = Reem(__dirname),
				f = function() {};
			assert.equal(f, r.error(f));
			assert.equal(r.error()(), void 0);
		});
	});
});
