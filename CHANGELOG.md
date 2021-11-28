## [1.3.1](https://github.com/aidenlx/folder-note-core/compare/1.3.1...1.3.2) (2021-11-23)


### Bug Fixes

* **api:** fix OpenFolderNote not implement properly; add config param in OpenFolderNote ([e533095](https://github.com/aidenlx/folder-note-core/commit/e53309521101dec5f5d745cb7422e3dc0285389b)), closes [#6](https://github.com/aidenlx/folder-note-core/issues/6)



# [1.3.0](https://github.com/aidenlx/folder-note-core/compare/1.3.1...1.3.2) (2021-11-21)


### Features

* **api:** add menu item and api to open folder note of given folder ([11abe93](https://github.com/aidenlx/folder-note-core/commit/11abe93746eee15c76bbd360c26bfe6fbdd21df7)), closes [#3](https://github.com/aidenlx/folder-note-core/issues/3)
* **resolver** fix createFolderForNote not working properly ([3f5a3cc](https://github.com/aidenlx/folder-note-core/commit/3f5a3cc910dfcc5861a8804f9af8709336a28632))



## [1.2.6](https://github.com/aidenlx/folder-note-core/compare/1.2.5...1.2.6) (2021-11-18)


### Bug Fixes

* **resolver:** fix createFolderForNote exec when already folder note in index&inside-same strategy ([68d2e73](https://github.com/aidenlx/folder-note-core/commit/68d2e73812121bc192cb9591c69d57376792c14a))

## [1.2.5](https://github.com/aidenlx/folder-note-core/compare/1.2.4...1.2.5) (2021-09-15)


### Bug Fixes

* **resolver:** fix getFolderPath failed to get filename when given path string ([39d0164](https://github.com/aidenlx/folder-note-core/commit/39d016474b7b741737070f6477fbfa8565130987))

## [1.2.4](https://github.com/aidenlx/folder-note-core/compare/1.2.3...1.2.4) (2021-09-15)


### Bug Fixes

* **resolver:** fix dot in folder path breaks folder note resolution ([6fdb8dd](https://github.com/aidenlx/folder-note-core/commit/6fdb8dd17054bb8ba119f44d4e74a8a9ebdfb5e0))

## [1.2.3](https://github.com/aidenlx/folder-note-core/compare/1.2.2...1.2.3) (2021-09-12)


### Bug Fixes

* **resolver:** fix fail to get folder note path when path contains dots ([ea9162e](https://github.com/aidenlx/folder-note-core/commit/ea9162e264a5e1ba5d49fb23c187bfc7bd6520c8))

## [1.2.2](https://github.com/aidenlx/folder-note-core/compare/1.2.1...1.2.2) (2021-09-12)


### Features

* **settings:** add option to set log level; expose renderLogLevel in api ([d284dd6](https://github.com/aidenlx/folder-note-core/commit/d284dd6cb8aa6536fa18748a2793c8783c27a8f5))

## [1.2.1](https://github.com/aidenlx/folder-note-core/compare/1.2.0...1.2.1) (2021-09-12)


### Bug Fixes

* update mobile flag ([84855ae](https://github.com/aidenlx/folder-note-core/commit/84855aed8e698b126c33d65e3ba48010d3e53839))

# [1.2.0](https://github.com/aidenlx/folder-note-core/compare/1.1.0...1.2.0) (2021-09-12)


### Features

* settings: add batch convert between strategies; api: new option to specify strategy ([0fd5bf2](https://github.com/aidenlx/folder-note-core/commit/0fd5bf2408dade7bed194727d1ad4cd4c8ea984e))

# [1.1.0](https://github.com/aidenlx/folder-note-core/compare/1.0.2...1.1.0) (2021-09-12)


### Bug Fixes

* **resolver:** getFolderNotePath no longer throw uncaught error when given path contains extension ([f86a0a5](https://github.com/aidenlx/folder-note-core/commit/f86a0a501cf07b5a5b9b4fa851624127148a7585))


### Features

* add file menu option to delete note with folder for linked folder ([4d86d46](https://github.com/aidenlx/folder-note-core/commit/4d86d467602676044b1895ad13f6ffb3f4620423))
* new note created in folder note is placed in linked folder properly ([02fa8bf](https://github.com/aidenlx/folder-note-core/commit/02fa8bff5eb54e932319d06bfc8db6b89762f0f9))

## [1.0.2](https://github.com/aidenlx/folder-note-core/compare/1.0.1...1.0.2) (2021-09-07)


### Bug Fixes

* **resolver:** remove notice on dryrun for createFolderForNote ([f2f2ddf](https://github.com/aidenlx/folder-note-core/commit/f2f2ddf1941798160a6deec16ffe3ca8cc516d6a))

## [1.0.1](https://github.com/aidenlx/folder-note-core/compare/1.0.0...1.0.1) (2021-09-07)


### Bug Fixes

* **commands:** remove source restriction for file-menu ([4b6d702](https://github.com/aidenlx/folder-note-core/commit/4b6d70241fa6d47715b87fd11d45750b3d7ab13c))

# [1.0.0](https://github.com/aidenlx/folder-note-core/compare/0.2.0...1.0.0) (2021-09-07)


### Bug Fixes

* **commands:** fix createFolderForNote() check not using await ([7a26e60](https://github.com/aidenlx/folder-note-core/commit/7a26e60e2f17a7fb81ca497de24557db4bfcf97e))
* **resolver:** fix invaild path returned when given file/folder's parent is root dir ([140f1c4](https://github.com/aidenlx/folder-note-core/commit/140f1c469007b69a62b6f3301a278994d79803da))
* **settings:** move mod key setting back to alx-folder-note ([fec1f21](https://github.com/aidenlx/folder-note-core/commit/fec1f212f32a50cebbff1541ca69deccfd6797ff))


### Features

* **api:** add api ready event ([e6b4779](https://github.com/aidenlx/folder-note-core/commit/e6b47797ce276ce29e66f19d29ce1e7bcf9f15f7))
* **api:** add util lib for npm package ([6aadaf4](https://github.com/aidenlx/folder-note-core/commit/6aadaf45df0ea603f33b719608d1add5ff066ced))
* **api:** expose getNewFolderNote(), getFolderNotePath() and getFolderPath() ([9642cc6](https://github.com/aidenlx/folder-note-core/commit/9642cc6ff403e73e7aa14204baeff7e550c09858))
* **api:** update api import: no manual types.d.ts needed ([048342c](https://github.com/aidenlx/folder-note-core/commit/048342c0cb7e03d786f6553418f3fb5e5dc202dc))


### BREAKING CHANGES

* **api:** FolderNoteAPI is no longer a default export
* **api:** getFolderNote() no longer accept second arg when given path; getFolderNote() and getFolderFromNote() will return null when given file invaild (detail provided in console)

# [0.2.0](https://github.com/aidenlx/folder-note-core/compare/0.1.0...0.2.0) (2021-09-01)


### Features

* **settings:** expose items in setting tabs in api; fix OldConfig def ([1b878d9](https://github.com/aidenlx/folder-note-core/commit/1b878d9ee8804eed8541fcac8ce59081166b2c39))

# 0.1.0 (2021-09-01)


### Features

* **api:** import settings from alx-folder-note ([2375deb](https://github.com/aidenlx/folder-note-core/commit/2375debed8cb23a9727d76d5a3c34b5ace667101))
* migrate code from alx-folder-note ([64a6991](https://github.com/aidenlx/folder-note-core/commit/64a699159b8a21e94a7f965c4a2fc7f1c5f2af8a))

