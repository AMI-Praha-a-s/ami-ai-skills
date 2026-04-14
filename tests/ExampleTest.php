<?php

use AmiPraha\AmiAiSkills\AmiAiSkillsClass;

it('can autoload the package namespace', function () {
    expect(class_exists(AmiAiSkillsClass::class))->toBeTrue();
});
